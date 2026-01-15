# Product Requirements Document (PRD): EduPlus Learning Platform

## Executive Summary

EduPlus is a comprehensive educational platform designed to deliver personalized learning experiences through Android mobile app for students and web interface for administrators. The platform will leverage **self-hosted video streaming via Bunny Stream** as the primary content delivery mechanism, supporting both recorded videos and live streams with a fully customizable video player. This is supplemented by interactive notes and Daily Practice Problems (DPP) to ensure complete learning coverage.

## Objectives

1. **Primary Goal**: Create an end-to-end learning management system that combines video content with interactive practice materials
2. **Content Strategy**: Self-hosted video streaming via Bunny Stream for full control over UI/UX, branding, and student access
3. **User Experience**: Provide seamless learning experience across mobile and web platforms with custom video player
4. **Scalability**: Support multiple subjects, competitive exam targets (JEE, NEET, etc.), and thousands of users

## Target Audience

### Primary Users
- **Students**: High school and college students preparing for competitive exams (JEE, NEET, etc.)
- **Age Range**: 16-25 years
- **Tech Proficiency**: Moderate (comfortable with mobile apps)

### Secondary Users
- **Administrators**: Content creators and platform managers
- **Instructors**: Subject matter experts uploading and managing content

## Features and Requirements

### Core Features

#### 1. Authentication & User Management
- **Email/Password Authentication**: Standard login/signup
- **Social Login**: Google OAuth integration
- **Role-Based Access**: Student and Admin roles
- **OTP Verification**: Email verification for account security
- **Profile Management**: User preferences, target exams, study goals

#### 2. Content Management System
- **Course Structure**: Hierarchical organization (Course → Subject → Lesson → Videos/Notes/DPP)
- **Self-Hosted Video Streaming (Bunny Stream)**:
  - **Recorded Videos**:
    - Upload raw videos (MP4, MOV) via admin panel
    - Auto-transcoding to HLS (adaptive bitrate: 1080p/720p/480p)
    - Thumbnail generation and metadata extraction
    - Token authentication for secure student access
  - **Live Streaming**:
    - RTMP ingest via OBS Studio or mobile apps
    - Real-time HLS playback in native app
    - Auto-recording for on-demand replay
    - Live indicators and notifications for students
  - **Custom Video Player**:
    - Bunny Stream embedded player (customizable colors, controls, branding)
    - Alternative: `react-native-video` with HLS URLs for full custom UI
    - Progress tracking (watch time, completion percentage)
    - Bookmarking and note-taking on videos
    - Offline viewing capability via caching
  - **Video Processing Pipeline**:
    - Raw upload (TUS resumable) → Bunny transcoding → Global CDN delivery
    - Webhook notifications for processing status
    - Metadata storage (duration, resolution, file size)
  - **Content Protection**:
    - Hotlink protection
    - Token authentication
    - Media Cage DRM (optional for premium content)
- **Rich Notes**:
  - File attachments (PDFs, images)
  - Download functionality
- **Daily Practice Problems (DPP)**:
  - Multiple choice questions
  - Image support in questions/options
  - Timer-based attempts
  - Instant feedback and explanations

#### 3. Learning Experience
- **Personalized Dashboard**: Course progress, study streaks, recommendations
- **Progress Tracking**:
  - Video completion percentage
  - Test scores and analytics
  - Study time tracking
  - Achievement badges
- **Interactive Learning**:
  - Bookmarking system
  - Note-taking on videos
  - Question difficulty ratings
- **Gamification**:
  - Study streaks
  - Leaderboards
  - Achievement system

#### 4. Admin Panel
- **Content Upload**: Bulk upload interface for videos, notes, DPP
- **Course Management**: Create/edit courses, modules, content hierarchy
- **User Analytics**: Student progress reports, engagement metrics
- **Content Moderation**: Publish/draft workflow
- **Bulk Operations**: Mass content updates, user management

### Technical Requirements

#### Platform Architecture
- **Mobile App**: React Native (Expo) for Android
- **Web App**: React with TanStack Router
- **Backend**: Hono.js server with oRPC
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Better Auth with role-based permissions
- **Video Infrastructure**:
  - **Streaming Provider**: Bunny Stream (recorded + live)
  - **Video Player**: Bunny Stream embedded player (customizable) or react-native-video with HLS
  - **Storage**: Bunny Storage for raw uploads (temporary)
  - **CDN**: Bunny CDN (119 PoPs, 250+ Tbps backbone)
  - **Processing**: Bunny Stream auto-transcoding (HLS, multi-resolution)

#### Performance Requirements
- **Video Loading**: <3 seconds initial load
- **App Size**: <50MB initial download
- **Offline Support**: Core content caching
- **Concurrent Users**: Support 10,000+ simultaneous users

#### Security Requirements
- **Data Encryption**: End-to-end encryption for user data
- **Content Protection**: DRM for premium content (future)
- **API Security**: Rate limiting, input validation
- **Privacy Compliance**: GDPR/CCPA compliance

## Timeline and Milestones

### Phase 1: MVP (Months 1-3)
- Basic authentication and user profiles
- Course browsing and enrollment
- YouTube video player integration
- Basic progress tracking
- Admin content upload (videos only)

### Phase 2: Core Features (Months 4-6)
- Rich text notes system
- DPP creation and attempt system
- Advanced progress analytics
- Study streaks and gamification
- Mobile app optimization

### Phase 3: Enhancement (Months 7-9)
- Offline content support
- Advanced admin analytics
- Social features (leaderboards, discussions)
- Performance optimization
- Beta testing and feedback integration

### Phase 4: Launch & Scale (Months 10-12)
- Full platform launch
- Marketing and user acquisition
- Content expansion
- Advanced features (AI recommendations, etc.)

## Risks and Assumptions

### Key Risks
1. **Video Processing Costs**: Bunny Stream charges per GB stored/delivered; monitor usage (though significantly cheaper than alternatives)
2. **Live Streaming Latency**: Real-time broadcasts may have 5-15s delay; optimize for educational use cases
3. **Storage Growth**: Self-hosted videos require storage management; implement cleanup policies for raw uploads
4. **Content Quality Control**: Ensuring educational accuracy of uploaded materials
5. **Mobile Performance**: Video streaming optimization for varying network conditions
6. **Competition**: Established players in edtech space
7. **Regulatory Compliance**: Educational content standards and data privacy laws

### Assumptions
1. **Video Infrastructure**: Bunny Stream handles scale (100+ students, 50+ videos) within budget (~$3-10/month)
2. **User Adoption**: Target audience has smartphones and reliable internet
3. **Monetization**: Freemium model with premium content/features
4. **Technical Feasibility**: Current tech stack can handle projected scale
5. **Team Resources**: Development team has necessary skills in React Native, Node.js, MongoDB
6. **Bandwidth**: Students have sufficient bandwidth for HLS streaming (min 1Mbps for 480p)

## Dependencies

### External Dependencies
- **Bunny Stream API**: Video hosting, transcoding, and live streaming
- **Bunny Storage**: Temporary storage for raw video uploads
- Email service for OTP and notifications
- File storage service for note attachments (PDFs)
- Analytics platform for user behavior tracking

### Internal Dependencies
- Content creation team for course materials
- Subject matter experts for DPP creation
- Marketing team for user acquisition
- DevOps team for infrastructure scaling

## Video Infrastructure Cost Estimate

### Bunny Stream Pricing (100+ Students, ~50 Videos)
| Item | Cost | Notes |
|------|------|-------|
| Storage | $0.01/GB/month | ~$0.50 for 50GB |
| Bandwidth/Delivery | $0.005-0.01/GB | Up to 10x cheaper than competitors |
| Transcoding | FREE | No encoding fees |
| Video Player | FREE | Customizable, included |
| Live Streaming | Included | Part of Stream pricing |
| **Total Estimate** | **$3-10/month** | Scales with usage |

### Cost Optimization Strategies
- Delete raw uploads after transcoding to save storage
- Use adaptive bitrate to reduce bandwidth for low-quality devices
- Leverage Bunny's global CDN (119 PoPs) for faster delivery
- Monitor usage via Bunny dashboard

### Additional Features (No Extra Cost)
- AI transcription/subtitles (Transcribe AI)
- Hotlink protection
- Token authentication
- Watermarking
- Multi-resolution transcoding

## Conclusion

EduPlus represents a comprehensive solution for competitive exam preparation, combining the accessibility of mobile learning with the depth of structured educational content. The platform's focus on **self-hosted video streaming via Bunny Stream** provides full control over UI/UX, branding, and student access—eliminating third-party dependencies like YouTube while maintaining exceptional affordability (~$3-10/month vs $30+ for alternatives).

The phased approach ensures steady progress toward a fully-featured platform, with clear metrics for success and identified risks for proactive management. The customizable video player, free transcoding, and live streaming capabilities differentiate EduPlus from competitors relying on embedded third-party players or expensive video infrastructure.
