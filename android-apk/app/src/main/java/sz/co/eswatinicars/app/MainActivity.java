package sz.co.eswatinicars.app;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.content.pm.PackageManager;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

/**
 * Eswatini Cars — WebView wrapper with native Google Sign-In.
 *
 * Package: sz.co.eswatinicars.app
 *
 * Key fixes in this version (v7):
 *   1. signOut() before getSignInIntent() — forces the account picker to show
 *      every time, instead of silently re-using the last signed-in account.
 *   2. clearSession() @JavascriptInterface — clears WebView cookies + cache
 *      so logout actually persists (WebView was caching the session cookie
 *      and re-authenticating the user on next launch).
 *
 * JS bridge name: "Android" (window.Android from JavaScript).
 *   - window.Android.googleSignIn()  → launches native Google account picker
 *   - window.Android.clearSession()  → wipes cookies + cache (called on logout)
 *   - window.Android.getAppVersion() → returns version name (for debugging)
 */
public class MainActivity extends AppCompatActivity {

    private static final String LAUNCH_URL = "https://eswatini-cars.vercel.app/";
    private static final String TAG = "EswatiniCars";

    private WebView webView;
    private GoogleSignInClient mGoogleSignInClient;

    // Activity result launcher for Google Sign-In intent (replaces deprecated
    // startActivityForResult + onActivityResult — required for AndroidX Activity 1.2+).
    private final ActivityResultLauncher<Intent> googleSignInLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(),
                    new ActivityResultCallback<ActivityResult>() {
                        @Override
                        public void onActivityResult(ActivityResult result) {
                            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                                Task<GoogleSignInAccount> task =
                                        GoogleSignIn.getSignedInAccountFromIntent(result.getData());
                                try {
                                    GoogleSignInAccount account = task.getResult(ApiException.class);
                                    if (account != null && account.getIdToken() != null) {
                                        sendNativeSignInResult(account);
                                    } else {
                                        sendNativeSignInError("No ID token returned");
                                    }
                                } catch (ApiException e) {
                                    sendNativeSignInError("Sign-in failed: code " + e.getStatusCode());
                                }
                            } else {
                                // User cancelled the account picker — not an error
                                sendNativeSignInError("cancelled");
                            }
                        }
                    });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Configure Google Sign-In options.
        // requestIdToken() — server gets a verifiable JWT (verified via Google JWKS in /api/auth/google).
        // requestEmail()   — we need the email to look up / create the user account server-side.
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.default_web_client_id))
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        // Set up the WebView
        webView = new WebView(this);
        setContentView(webView);

        configureWebView();

        // Load the launch URL (or saved state if rotated)
        if (savedInstanceState == null) {
            webView.loadUrl(LAUNCH_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }

        // Handle back button: navigate WebView history first, then exit
        OnBackPressedCallback backCallback = new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    onBackPressed();
                }
            }
        };
        getOnBackPressedDispatcher().addCallback(this, backCallback);

        // Request GET_ACCOUNTS permission at runtime (needed on some Android versions
        // to enumerate Google accounts for the picker).
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.GET_ACCOUNTS)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.GET_ACCOUNTS}, 100);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage for My Posts tracking
        s.setDatabaseEnabled(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " EswatiniCarsApp/1.0");

        // Enable third-party cookies (Firebase Auth needs them)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }
        CookieManager.getInstance().setAcceptCookie(true);

        // JS bridge — exposed as window.Android
        webView.addJavascriptInterface(new NativeBridge(), "Android");

        // Open external links (tel:, mailto:, WhatsApp, etc.) in the system handler
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri url = req.getUrl();
                String scheme = url.getScheme();
                if (scheme != null && (scheme.equals("http") || scheme.equals("https"))) {
                    String host = url.getHost();
                    // Keep navigation inside our own domain inside the WebView
                    if (host != null && (host.equals("eswatini-cars.vercel.app")
                            || host.endsWith(".vercel.app")
                            || host.equals("eswatini-cars.netlify.app")
                            || host.equals("eswatinicars.co.sz"))) {
                        return false; // load in WebView
                    }
                }
                // Anything else (tel:, mailto:, whatsapp:, external http) — system handler
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, url);
                    startActivity(i);
                } catch (Exception e) {
                    // No app to handle the URL — ignore
                }
                return true;
            }
        });

        // Allow prompts, alerts, file chooser for image upload
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });
    }

    /**
     * JS bridge — exposed to JavaScript as window.Android.
     * Methods must be @JavascriptInterface-annotated or they are invisible to JS.
     */
    private class NativeBridge {

        /**
         * Launch the native Google Sign-In account picker.
         *
         * CRITICAL FIX: We call mGoogleSignInClient.signOut() BEFORE
         * getSignInIntent(). Without this, the picker silently re-uses
         * the last signed-in account and the user is auto-logged-in
         * without seeing the account chooser.
         *
         * The web side waits for a 'native-google-signin' CustomEvent
         * with detail.idToken / detail.email / detail.error.
         */
        @JavascriptInterface
        public void googleSignIn() {
            runOnUiThread(() -> {
                // signOut() clears the cached account selection so the picker
                // always shows. Add a listener to launch the intent once signOut
                // completes (signOut is async).
                mGoogleSignInClient.signOut().addOnCompleteListener(MainActivity.this, task -> {
                    Intent signInIntent = mGoogleSignInClient.getSignInIntent();
                    googleSignInLauncher.launch(signInIntent);
                });
            });
        }

        /**
         * Clear all WebView cookies + cache.
         *
         * CRITICAL FIX: Called by the web side's logout() function via
         * window.Android.clearSession(). Without this, the WebView caches
         * the session cookie and the user is silently re-authenticated on
         * next launch — even after the server-side logout endpoint was hit.
         */
        @JavascriptInterface
        public void clearSession() {
            runOnUiThread(() -> {
                CookieManager cm = CookieManager.getInstance();
                cm.removeAllCookies(null);
                cm.flush();
                if (webView != null) {
                    webView.clearCache(true);
                    webView.clearHistory();
                }
                // Also revoke Google Sign-In access so the next sign-in
                // shows the picker fresh (belt-and-braces with signOut()).
                mGoogleSignInClient.revokeAccess();
            });
        }

        @JavascriptInterface
        public String getAppVersion() {
            try {
                return getPackageManager()
                        .getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "unknown";
            }
        }

        @JavascriptInterface
        public void showToast(String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
        }
    }

    /**
     * Push the sign-in result back into the WebView as a CustomEvent.
     * Web side listens for 'native-google-signin'.
     */
    private void sendNativeSignInResult(GoogleSignInAccount account) {
        String idToken = account.getIdToken();
        String email = account.getEmail();
        String name = account.getDisplayName();
        String safeName = name == null ? "" : name.replace("'", "\\'");
        String js = "window.dispatchEvent(new CustomEvent('native-google-signin'," +
                "{detail:{ok:true,idToken:'" + idToken + "',email:'" + email + "',name:'" + safeName + "'}}));";
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }

    private void sendNativeSignInError(String err) {
        String js = "window.dispatchEvent(new CustomEvent('native-google-signin'," +
                "{detail:{ok:false,error:'" + err + "'}}));";
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) CookieManager.getInstance().flush();
    }
}
