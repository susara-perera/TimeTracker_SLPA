import React from 'react';
import './Footer.css';
import footerVideo from '../../assets/fottermp4.mp4';


const Footer = () => {
  return (
    <div className="footer-wrapper">
      {/* Professional Footer Bar - Above Video */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <i className="bi bi-shield-check"></i>
              <div className="footer-brand">
                <span className="brand-name">Sri Lanka Ports Authority</span>
                <span className="brand-subtitle">Time Tracking & Attendance System</span>
              </div>
            </div>
          </div>
          
          <div className="footer-center">
            <div className="information-system">
              <span className="info-label">Information System</span>
              <div className="system-details">
                <div>© 2025 SLPA. All rights reserved.</div>
                <div>Time Tracking & Attendance Management</div>
              </div>
            </div>
          </div>
          
          <div className="footer-right">
            <div className="footer-info">
              <div className="system-status">
                <span className="status-dot online"></span>
                <span>System Online</span>
              </div>
              <div className="version-info">v2.1.0</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Background Section - Below Footer Content */}
      <div className="footer-video-section">
        <div className="video-container">
          <video 
            className="footer-video" 
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src={footerVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
