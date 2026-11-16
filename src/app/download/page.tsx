import { NextRequest } from 'next/server'

export const dynamic = 'force-static'

// A simple, clean download landing page for the Eswatini Cars APK.
// Users come here to download the app. When a custom domain is added
// later (e.g., eswatinicars.com), this page is automatically served
// at eswatinicars.com/download — no code changes needed.

const APK_URL = 'https://github.com/mlandvodlamini12-cloud/eswatini-cars/releases/download/v1.2.0/Eswatini-Cars.apk'
const APK_VERSION = '1.1.1'
const APK_SIZE = '3.3 MB'

export default function DownloadPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Download the Eswatini Cars app — browse verified vehicles, sell your car for free, safe viewings, no scammers." />
        <title>Download — Eswatini Cars</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a1834;
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            max-width: 480px;
            width: 100%;
            text-align: center;
          }
          .logo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e3a6f, #0a1834);
            border: 3px solid #ffc832;
            box-shadow: 0 0 30px rgba(255, 200, 50, 0.3);
            overflow: hidden;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 8px;
            color: #fff;
          }
          .subtitle {
            font-size: 16px;
            color: #8a9bb5;
            margin-bottom: 32px;
          }
          .download-btn {
            display: inline-block;
            background: linear-gradient(135deg, #ffc832, #e6a020);
            color: #0a1834;
            font-size: 20px;
            font-weight: bold;
            padding: 18px 48px;
            border-radius: 50px;
            text-decoration: none;
            margin-bottom: 8px;
            box-shadow: 0 4px 20px rgba(255, 200, 50, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .download-btn:active {
            transform: scale(0.97);
            box-shadow: 0 2px 10px rgba(255, 200, 50, 0.3);
          }
          .file-info {
            font-size: 14px;
            color: #8a9bb5;
            margin-bottom: 32px;
          }
          .qr-section {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 24px;
          }
          .qr-section p {
            font-size: 14px;
            color: #8a9bb5;
            margin-bottom: 16px;
          }
          .qr-section img {
            width: 200px;
            height: 200px;
            border-radius: 12px;
          }
          .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
            text-align: left;
          }
          .feature {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 14px;
            font-size: 13px;
            color: #c0cee0;
          }
          .feature-icon {
            color: #ffc832;
            font-size: 20px;
            margin-bottom: 4px;
          }
          .instructions {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            padding: 20px;
            text-align: left;
          }
          .instructions h3 {
            font-size: 15px;
            color: #ffc832;
            margin-bottom: 12px;
            text-align: center;
          }
          .instructions ol {
            list-style: none;
            counter-reset: step;
          }
          .instructions li {
            counter-increment: step;
            font-size: 13px;
            color: #a0b0c8;
            margin-bottom: 8px;
            padding-left: 28px;
            position: relative;
          }
          .instructions li::before {
            content: counter(step);
            position: absolute;
            left: 0;
            top: 0;
            width: 20px;
            height: 20px;
            background: #ffc832;
            color: #0a1834;
            border-radius: 50%;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .footer {
            margin-top: 24px;
            font-size: 12px;
            color: #5a6a85;
          }
          .footer a, .footer button {
            color: #8a9bb5;
            text-decoration: none;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 12px;
            font-family: inherit;
            padding: 0;
          }
          /* Modal overlay for Terms/Privacy popups */
          .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .modal-overlay.active {
            display: flex;
          }
          .modal-content {
            background: #0a1834;
            border: 1px solid rgba(255, 200, 50, 0.3);
            border-radius: 20px;
            width: 100%;
            max-width: 500px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .modal-title {
            color: #ffc832;
            font-size: 18px;
            font-weight: bold;
          }
          .modal-close {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-close:active {
            background: rgba(255, 255, 255, 0.2);
          }
          .modal-body {
            overflow-y: auto;
            flex: 1;
            padding: 0;
          }
          .modal-body iframe {
            width: 100%;
            height: 100%;
            min-height: 400px;
            border: none;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Logo */}
          <div className="logo">
            <img src="/app-icon.png" alt="Eswatini Cars logo" />
          </div>

          {/* Title */}
          <h1>Eswatini Cars</h1>
          <p className="subtitle">Find your next vehicle in Eswatini</p>

          {/* Download button */}
          <a href={APK_URL} className="download-btn">
            Download App
          </a>
          <p className="file-info">
            Version {APK_VERSION} · {APK_SIZE} · Android APK
          </p>

          {/* QR code */}
          <div className="qr-section">
            <p>Or scan this QR code with your phone camera</p>
            <img src="/qr-download.png" alt="QR code to download the app" />
          </div>

          {/* Features */}
          <div className="features">
            <div className="feature">
              <div className="feature-icon">&#10003;</div>
              Browse verified vehicles
            </div>
            <div className="feature">
              <div className="feature-icon">&#10003;</div>
              Sell your car for free
            </div>
            <div className="feature">
              <div className="feature-icon">&#10003;</div>
              Safe, managed viewings
            </div>
            <div className="feature">
              <div className="feature-icon">&#10003;</div>
              No scammers. No brokers.
            </div>
          </div>

          {/* Install instructions */}
          <div className="instructions">
            <h3>How to install</h3>
            <ol>
              <li>Tap "Download App" above</li>
              <li>Wait for the download to finish</li>
              <li>Open the downloaded file (Eswatini-Cars.apk)</li>
              <li>If prompted, allow "Install from unknown sources"</li>
              <li>Tap "Install" — the app appears on your home screen</li>
            </ol>
          </div>

          {/* Footer + Modal — plain HTML to avoid React SSR issues with onclick handlers */}
          <div dangerouslySetInnerHTML={{ __html: `
            <div class="footer">
              <p>Made in Eswatini</p>
              <p style="margin-top: 4px;">
                <a href="/">Browse listings</a> ·
                <button onclick="openModal('terms')" style="color:#8a9bb5;background:none;border:none;cursor:pointer;font-size:12px;font-family:inherit;padding:0;">Terms</button> ·
                <button onclick="openModal('privacy')" style="color:#8a9bb5;background:none;border:none;cursor:pointer;font-size:12px;font-family:inherit;padding:0;">Privacy</button>
              </p>
            </div>

            <div id="legalModal" class="modal-overlay" onclick="closeModal()">
              <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                  <span class="modal-title" id="modalTitle">Terms & Conditions</span>
                  <button class="modal-close" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body">
                  <iframe id="modalFrame" src="" title="Legal document"></iframe>
                </div>
              </div>
            </div>

            <script>
              function openModal(type) {
                var overlay = document.getElementById('legalModal');
                var frame = document.getElementById('modalFrame');
                var title = document.getElementById('modalTitle');
                if (type === 'terms') {
                  frame.src = '/terms';
                  title.textContent = 'Terms & Conditions';
                } else if (type === 'privacy') {
                  frame.src = '/privacy';
                  title.textContent = 'Privacy Policy';
                }
                overlay.classList.add('active');
              }
              function closeModal() {
                var overlay = document.getElementById('legalModal');
                overlay.classList.remove('active');
                document.getElementById('modalFrame').src = '';
              }
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') closeModal();
              });
            </script>
          `}} />
        </div>
      </body>
    </html>
  )
}
