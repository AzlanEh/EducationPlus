import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Modal,
	Pressable,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PLAYER_HEIGHT = 220;

type VideoPlayerProps = {
	videoId: string;
	isLive?: boolean;
	onBack?: () => void;
};

type PlayerMessage = {
	type:
		| "ready"
		| "stateChange"
		| "timeUpdate"
		| "duration"
		| "error"
		| "rateChange";
	data?: number | string;
};

// Format time in mm:ss or hh:mm:ss
function formatTime(seconds: number): string {
	const totalSeconds = Math.floor(seconds);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;

	if (hours > 0) {
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}
	return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Generate the HTML for the YouTube player
function getPlayerHTML(videoId: string): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 100%; 
      height: 100%; 
      background: #000; 
      overflow: hidden;
    }
    #player {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    /* Hide YouTube branding elements */
    .ytp-chrome-top,
    .ytp-show-cards-title,
    .ytp-watermark,
    .ytp-youtube-button,
    .ytp-impression-link,
    .ytp-title,
    .ytp-title-channel,
    .ytp-share-button,
    .ytp-watch-later-button,
    .ytp-copylink-button,
    .ytp-menuitem[data-title-no-tooltip="Copy link"] {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  </style>
</head>
<body>
  <div id="player"></div>
  <script>
    var player;
    var timeUpdateInterval;
    
    function sendMessage(type, data) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
    }
    
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        videoId: '${videoId}',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          origin: 'https://www.youtube.com'
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
          onPlaybackRateChange: onPlaybackRateChange
        }
      });
    }
    
    function onPlayerReady(event) {
      sendMessage('ready');
      sendMessage('duration', player.getDuration());
    }
    
    function onPlayerStateChange(event) {
      sendMessage('stateChange', event.data);
      
      // Start/stop time updates based on state
      if (event.data === YT.PlayerState.PLAYING) {
        startTimeUpdates();
      } else {
        stopTimeUpdates();
        // Send one final time update
        sendMessage('timeUpdate', player.getCurrentTime());
      }
      
      // Get duration when video starts
      if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.CUED) {
        var dur = player.getDuration();
        if (dur > 0) {
          sendMessage('duration', dur);
        }
      }
    }
    
    function onPlayerError(event) {
      sendMessage('error', event.data);
    }
    
    function onPlaybackRateChange(event) {
      sendMessage('rateChange', event.data);
    }
    
    function startTimeUpdates() {
      stopTimeUpdates();
      timeUpdateInterval = setInterval(function() {
        if (player && player.getCurrentTime) {
          sendMessage('timeUpdate', player.getCurrentTime());
        }
      }, 250);
    }
    
    function stopTimeUpdates() {
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
      }
    }
    
    // Commands from React Native
    function playVideo() {
      if (player && player.playVideo) player.playVideo();
    }
    
    function pauseVideo() {
      if (player && player.pauseVideo) player.pauseVideo();
    }
    
    function seekTo(seconds) {
      if (player && player.seekTo) player.seekTo(seconds, true);
    }
    
    function setPlaybackRate(rate) {
      if (player && player.setPlaybackRate) player.setPlaybackRate(rate);
    }
    
    // Load YouTube IFrame API
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  </script>
</body>
</html>
`;
}

export function VideoPlayer({
	videoId,
	isLive = false,
	onBack,
}: VideoPlayerProps) {
	const webViewRef = useRef<WebView>(null);
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [showControls, setShowControls] = useState(true);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [isPlayerReady, setIsPlayerReady] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isSeeking, setIsSeeking] = useState(false);

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	// Send command to WebView
	const sendCommand = useCallback((command: string) => {
		webViewRef.current?.injectJavaScript(`${command}; true;`);
	}, []);

	// Handle messages from WebView
	const handleMessage = useCallback((event: WebViewMessageEvent) => {
		try {
			const message: PlayerMessage = JSON.parse(event.nativeEvent.data);
			console.log("[VideoPlayer] Message:", message.type, message.data);

			switch (message.type) {
				case "ready":
					setIsPlayerReady(true);
					break;
				case "stateChange":
					// YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
					if (message.data === 1) {
						setPlaying(true);
					} else if (message.data === 2 || message.data === 0) {
						setPlaying(false);
					}
					break;
				case "timeUpdate":
					if (typeof message.data === "number") {
						setCurrentTime(message.data);
					}
					break;
				case "duration":
					if (typeof message.data === "number" && message.data > 0) {
						setDuration(message.data);
					}
					break;
				case "error":
					console.log("[VideoPlayer] Error:", message.data);
					break;
				case "rateChange":
					if (typeof message.data === "number") {
						setPlaybackRate(message.data);
					}
					break;
			}
		} catch (e) {
			console.log("[VideoPlayer] Failed to parse message:", e);
		}
	}, []);

	// Toggle play/pause
	const togglePlayPause = useCallback(() => {
		if (playing) {
			sendCommand("pauseVideo()");
		} else {
			sendCommand("playVideo()");
		}
	}, [playing, sendCommand]);

	// Seek forward/backward
	const handleSeek = useCallback(
		(seconds: number) => {
			setIsSeeking(true);
			const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
			sendCommand(`seekTo(${newTime})`);
			setCurrentTime(newTime);
			setTimeout(() => setIsSeeking(false), 500);
		},
		[currentTime, duration, sendCommand],
	);

	// Handle progress bar tap
	const handleProgressBarPress = useCallback(
		(event: { nativeEvent: { locationX: number } }) => {
			if (duration === 0) return;
			setIsSeeking(true);
			const progressBarWidth = isFullscreen
				? SCREEN_HEIGHT - 140
				: SCREEN_WIDTH - 140;
			const tapPosition = event.nativeEvent.locationX;
			const percentage = Math.max(
				0,
				Math.min(tapPosition / progressBarWidth, 1),
			);
			const newTime = percentage * duration;
			sendCommand(`seekTo(${newTime})`);
			setCurrentTime(newTime);
			setTimeout(() => setIsSeeking(false), 500);
		},
		[duration, isFullscreen, sendCommand],
	);

	// Change playback speed
	const handleSpeedChange = useCallback(() => {
		const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
		const currentIndex = speeds.indexOf(playbackRate);
		const nextIndex = (currentIndex + 1) % speeds.length;
		const newRate = speeds[nextIndex];
		sendCommand(`setPlaybackRate(${newRate})`);
		setPlaybackRate(newRate);
	}, [playbackRate, sendCommand]);

	// Toggle controls visibility
	const toggleControls = useCallback(() => {
		setShowControls((prev) => !prev);
	}, []);

	// Toggle fullscreen
	const toggleFullscreen = useCallback(async () => {
		if (isFullscreen) {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.PORTRAIT_UP,
			);
			setIsFullscreen(false);
		} else {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.LANDSCAPE,
			);
			setIsFullscreen(true);
		}
	}, [isFullscreen]);

	// Auto-hide controls after 3 seconds when playing
	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;
		if (showControls && playing) {
			timeout = setTimeout(() => setShowControls(false), 3000);
		}
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [showControls, playing]);

	// Reset orientation when unmounting
	useEffect(() => {
		return () => {
			ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.PORTRAIT_UP,
			);
		};
	}, []);

	const renderPlayer = (fullscreen: boolean) => (
		<WebView
			ref={webViewRef}
			source={{ html: getPlayerHTML(videoId) }}
			style={[
				styles.webview,
				{
					height: fullscreen ? SCREEN_WIDTH : PLAYER_HEIGHT,
					width: fullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH,
				},
			]}
			onMessage={handleMessage}
			allowsInlineMediaPlayback={true}
			mediaPlaybackRequiresUserAction={false}
			javaScriptEnabled={true}
			domStorageEnabled={true}
			allowsFullscreenVideo={false}
			scrollEnabled={false}
			bounces={false}
			originWhitelist={["*"]}
			mixedContentMode="compatibility"
			androidLayerType="hardware"
		/>
	);

	const renderControls = (fullscreen: boolean) => (
		<Pressable style={styles.overlay} onPress={toggleControls}>
			{showControls && (
				<View style={styles.controlsContainer} pointerEvents="box-none">
					{/* Top Controls */}
					<View style={styles.topControls} pointerEvents="box-none">
						<Pressable
							onPress={fullscreen ? toggleFullscreen : onBack}
							style={styles.backButton}
						>
							<Ionicons name="arrow-back" size={24} color="white" />
						</Pressable>
						{isLive && (
							<View style={styles.liveBadge}>
								<View style={styles.liveDot} />
								<Text style={styles.liveText}>LIVE</Text>
							</View>
						)}
					</View>

					{/* Center Play Controls */}
					<View style={styles.centerControls} pointerEvents="box-none">
						{!isLive && (
							<Pressable
								onPress={() => handleSeek(-10)}
								style={styles.seekButton}
							>
								<Ionicons name="play-back" size={28} color="white" />
							</Pressable>
						)}

						<Pressable onPress={togglePlayPause} style={styles.playButton}>
							{isSeeking ? (
								<ActivityIndicator size="large" color="white" />
							) : (
								<Ionicons
									name={playing ? "pause" : "play"}
									size={40}
									color="white"
								/>
							)}
						</Pressable>

						{!isLive && (
							<Pressable
								onPress={() => handleSeek(10)}
								style={styles.seekButton}
							>
								<Ionicons name="play-forward" size={28} color="white" />
							</Pressable>
						)}
					</View>

					{/* Bottom Controls */}
					<View style={styles.bottomControls}>
						<Text style={styles.timeText}>{formatTime(currentTime)}</Text>
						<Pressable
							onPress={handleProgressBarPress}
							style={styles.progressBarContainer}
						>
							<View style={styles.progressBarBg}>
								<View
									style={[styles.progressBarFill, { width: `${progress}%` }]}
								/>
								<View
									style={[
										styles.progressThumb,
										{ left: `${Math.max(0, progress - 1)}%` },
									]}
								/>
							</View>
						</Pressable>
						<Text style={styles.timeText}>{formatTime(duration)}</Text>
						{!isLive && (
							<Pressable onPress={handleSpeedChange} style={styles.speedButton}>
								<Text style={styles.speedText}>{playbackRate}x</Text>
							</Pressable>
						)}
						<Pressable
							onPress={toggleFullscreen}
							style={styles.fullscreenButton}
						>
							<Ionicons
								name={fullscreen ? "contract" : "expand"}
								size={20}
								color="white"
							/>
						</Pressable>
					</View>
				</View>
			)}
		</Pressable>
	);

	// Fullscreen modal
	if (isFullscreen) {
		return (
			<Modal
				visible={isFullscreen}
				animationType="fade"
				supportedOrientations={["landscape"]}
				onRequestClose={toggleFullscreen}
			>
				<StatusBar hidden />
				<View style={styles.fullscreenContainer}>
					{renderPlayer(true)}
					{renderControls(true)}
				</View>
			</Modal>
		);
	}

	return (
		<View style={styles.container}>
			{renderPlayer(false)}
			{renderControls(false)}

			{!isPlayerReady && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="white" />
					<Text style={styles.loadingText}>Loading player...</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: PLAYER_HEIGHT,
		backgroundColor: "#000",
		position: "relative",
	},
	fullscreenContainer: {
		flex: 1,
		backgroundColor: "#000",
		justifyContent: "center",
		alignItems: "center",
	},
	webview: {
		backgroundColor: "#000",
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	controlsContainer: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	topControls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
	},
	backButton: {
		padding: 8,
	},
	liveBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#dc2626",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	liveDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "white",
		marginRight: 6,
	},
	liveText: {
		color: "white",
		fontSize: 12,
		fontWeight: "bold",
	},
	centerControls: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 40,
	},
	seekButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	playButton: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: "rgba(0,0,0,0.6)",
		justifyContent: "center",
		alignItems: "center",
	},
	bottomControls: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	timeText: {
		color: "white",
		fontSize: 12,
		minWidth: 45,
	},
	progressBarContainer: {
		flex: 1,
		height: 20,
		justifyContent: "center",
		marginHorizontal: 8,
	},
	progressBarBg: {
		height: 4,
		backgroundColor: "rgba(255,255,255,0.3)",
		borderRadius: 2,
		position: "relative",
	},
	progressBarFill: {
		height: 4,
		backgroundColor: "#dc2626",
		borderRadius: 2,
	},
	progressThumb: {
		position: "absolute",
		top: -4,
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#dc2626",
	},
	speedButton: {
		paddingHorizontal: 8,
	},
	speedText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	fullscreenButton: {
		paddingLeft: 8,
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		color: "white",
		marginTop: 10,
		fontSize: 14,
	},
});
