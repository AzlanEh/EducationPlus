import React from "react";
import {
	Dimensions,
	Image,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const App = () => {
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

			{/* Main Scrollable Content */}
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.headerTitle}>EDUCATION PLUS+</Text>
					<TouchableOpacity>
						<Ionicons name="notifications-outline" size={26} color="#000" />
						<View style={styles.notificationBadge} />
					</TouchableOpacity>
				</View>

				{/* Top Banner */}
				<View style={styles.bannerContainer}>
					{/* Placeholder for the Math Lecture Banner */}
					<Image
						source={{
							uri: "https://via.placeholder.com/350x180/003366/ffffff?text=Discrete+Mathematics+Banner",
						}}
						style={styles.bannerImage}
						resizeMode="cover"
					/>
				</View>

				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<Ionicons
						name="search"
						size={20}
						color="#666"
						style={styles.searchIcon}
					/>
					<TextInput
						placeholder="Search"
						style={styles.searchInput}
						placeholderTextColor="#999"
					/>
				</View>

				{/* Categories */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Categories</Text>
					<TouchableOpacity>
						<Text style={styles.viewAllText}>View All</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.categoriesRow}>
					<CategoryItem name="AMU" color="#e8f5e9" icon="school" />
					<CategoryItem name="CBSE" color="#e3f2fd" icon="book-open-variant" />
					<CategoryItem name="JNVST" color="#fff3e0" icon="bank" />
					<CategoryItem name="BEU" color="#f3e5f5" icon="domain" />
				</View>

				{/* Trending Batches */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Trending Batches</Text>
					<TouchableOpacity>
						<Text style={styles.viewAllText}>View All</Text>
					</TouchableOpacity>
				</View>

				{/* Batch Card */}
				<View style={styles.batchCard}>
					<View style={styles.batchCardHeader}>
						<Text style={styles.batchTag}>New</Text>
						<Image
							source={{
								uri: "https://via.placeholder.com/350x150/800000/ffffff?text=Physics+Force+%26+Pressure",
							}}
							style={styles.batchImage}
						/>
					</View>
					<View style={styles.batchContent}>
						<Text style={styles.batchTitle}>JNVST TITAN 2.0 2026</Text>
						<View style={styles.batchInfoRow}>
							<Icon name="home-variant" size={14} color="#666" />
							<Text style={styles.batchInfoText}> For Jnvst Class 9th</Text>
						</View>
						<View style={styles.batchInfoRow}>
							<Icon name="calendar" size={14} color="#666" />
							<Text style={styles.batchInfoText}>
								{" "}
								Starts on 7 April | Ends on 30 April 2026
							</Text>
						</View>

						<View style={styles.batchFooter}>
							<View>
								<Text style={styles.priceText}>₹ 2999</Text>
								<Text style={styles.discountText}>55% OFF</Text>
							</View>
							<View style={styles.buttonGroup}>
								<TouchableOpacity style={styles.exploreBtn}>
									<Text style={styles.exploreBtnText}>EXPLORE</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.buyBtn}>
									<Text style={styles.buyBtnText}>BUY NOW</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>

				{/* Study Grid Menu */}
				<Text
					style={[styles.sectionTitle, { marginTop: 25, marginBottom: 15 }]}
				>
					Study With Education Plus+
				</Text>
				<View style={styles.gridContainer}>
					<GridItem title="Study Material" icon="bookshelf" color="#4CAF50" />
					<GridItem title="Ask Doubts" icon="chat-question" color="#2196F3" />
					<GridItem
						title="Test & Quizzes"
						icon="clipboard-check"
						color="#FF9800"
					/>
					<GridItem
						title="Free Live Classes"
						icon="youtube-tv"
						color="#E91E63"
					/>
					<GridItem title="PYQ" icon="file-document" color="#607D8B" />
					<GridItem title="Free Classes" icon="play-box" color="#9C27B0" />
				</View>

				{/* Refer & Earn Banner */}
				<View style={styles.referCard}>
					<View style={styles.referContent}>
						<Text style={styles.referTitle}>Refer to your friends &</Text>
						<Text style={styles.referSubtitle}>Earn Plus+ Coins!</Text>
						<TouchableOpacity style={styles.shareBtn}>
							<Icon name="whatsapp" size={18} color="green" />
							<Text style={styles.shareBtnText}> Share Now</Text>
						</TouchableOpacity>
					</View>
					<Image
						source={{
							uri: "https://via.placeholder.com/100x100/transparent/000000?text=Kids",
						}} // Replace with actual illustration
						style={styles.referImage}
					/>
				</View>

				{/* Footer Tagline */}
				<View style={styles.footerTagline}>
					<Text style={styles.taglineText}>Give Wings to Your Dream !</Text>
					<Text style={styles.taglineSub}>With ❤️ Education Plus+</Text>
				</View>

				{/* Contact Button */}
				<TouchableOpacity style={styles.contactBtn}>
					<Icon name="phone" size={16} color="green" />
					<Text style={styles.contactBtnText}> Contact Us</Text>
				</TouchableOpacity>

				{/* Padding for bottom nav */}
				<View style={{ height: 80 }} />
			</ScrollView>

			{/* Bottom Navigation */}
			<View style={styles.bottomNav}>
				<NavItem name="Home" icon="home" active />
				<NavItem name="Performance" icon="chart-bar" />
				<NavItem name="My Batches" icon="layers" />
				<NavItem name="Profile" icon="account" />
			</View>
		</SafeAreaView>
	);
};

// --- Sub Components ---

const CategoryItem = ({ name, icon, color }) => (
	<View style={styles.categoryItem}>
		<View style={[styles.categoryIconContainer, { backgroundColor: "#fff" }]}>
			{/* Using an icon here, typically these are images/logos */}
			<Icon name={icon} size={30} color={color === "#fff" ? "#000" : "#333"} />
		</View>
		<Text style={styles.categoryText}>{name}</Text>
	</View>
);

const GridItem = ({ title, icon, color }) => (
	<TouchableOpacity style={styles.gridItem}>
		<Icon name={icon} size={40} color={color} style={styles.gridIcon} />
		<Text style={styles.gridText}>{title.replace(" ", "\n")}</Text>
	</TouchableOpacity>
);

const NavItem = ({ name, icon, active }) => (
	<TouchableOpacity style={styles.navItem}>
		<Icon name={icon} size={24} color={active ? "#0033cc" : "#999"} />
		<Text style={[styles.navText, active && { color: "#0033cc" }]}>{name}</Text>
	</TouchableOpacity>
);

// --- Styles ---

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f7fa",
	},
	scrollContent: {
		padding: 16,
	},
	// Header
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "900",
		color: "#000",
	},
	notificationBadge: {
		position: "absolute",
		right: 2,
		top: 2,
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "red",
	},
	// Banner
	bannerContainer: {
		borderRadius: 12,
		overflow: "hidden",
		marginBottom: 16,
		elevation: 3,
	},
	bannerImage: {
		width: "100%",
		height: 180,
	},
	// Search
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 25,
		paddingHorizontal: 15,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		height: 45,
		marginBottom: 20,
	},
	searchIcon: {
		marginRight: 10,
	},
	searchInput: {
		flex: 1,
		color: "#000",
	},
	// Section Headers
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#000",
	},
	viewAllText: {
		color: "#0033cc",
		fontSize: 12,
		fontWeight: "600",
	},
	// Categories
	categoriesRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	categoryItem: {
		alignItems: "center",
		width: width / 4.8,
	},
	categoryIconContainer: {
		width: 60,
		height: 60,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
		borderWidth: 1,
		borderColor: "#eee",
		elevation: 2,
		backgroundColor: "#fff",
	},
	categoryText: {
		fontWeight: "700",
		fontSize: 12,
		color: "#333",
	},
	// Trending Batch Card
	batchCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		overflow: "hidden",
		elevation: 4,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 5,
		marginBottom: 10,
	},
	batchCardHeader: {
		position: "relative",
	},
	batchImage: {
		width: "100%",
		height: 140,
	},
	batchTag: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: "#FFD700",
		color: "#000",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		fontSize: 10,
		fontWeight: "bold",
		zIndex: 1,
	},
	batchContent: {
		padding: 12,
	},
	batchTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#000",
		marginBottom: 8,
	},
	batchInfoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	batchInfoText: {
		fontSize: 12,
		color: "#666",
		marginLeft: 4,
	},
	batchFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
		paddingTop: 12,
	},
	priceText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000",
	},
	discountText: {
		fontSize: 10,
		color: "red",
		textDecorationLine: "line-through",
	},
	buttonGroup: {
		flexDirection: "row",
		gap: 10,
	},
	exploreBtn: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#0033cc",
	},
	exploreBtnText: {
		color: "#0033cc",
		fontSize: 12,
		fontWeight: "bold",
	},
	buyBtn: {
		backgroundColor: "#0033cc",
		paddingVertical: 6,
		paddingHorizontal: 16,
		borderRadius: 6,
	},
	buyBtnText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "bold",
	},
	// Grid Menu
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	gridItem: {
		width: "30%",
		backgroundColor: "#fff", // Or specific layout
		alignItems: "center",
		marginBottom: 20,
	},
	gridIcon: {
		marginBottom: 8,
	},
	gridText: {
		textAlign: "center",
		fontSize: 12,
		color: "#333",
		lineHeight: 16,
	},
	// Refer Card
	referCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		elevation: 2,
		marginTop: 10,
		marginBottom: 20,
	},
	referTitle: {
		fontSize: 12,
		color: "#666",
	},
	referSubtitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#000",
		marginBottom: 10,
	},
	shareBtn: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 6,
		alignSelf: "flex-start",
	},
	shareBtnText: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#333",
	},
	referImage: {
		width: 80,
		height: 80,
		resizeMode: "contain",
	},
	// Footer
	footerTagline: {
		alignItems: "center",
		marginVertical: 20,
	},
	taglineText: {
		fontSize: 22,
		fontWeight: "900",
		color: "#ddd", // Very light grey
		textAlign: "center",
	},
	taglineSub: {
		fontSize: 12,
		color: "#000",
		marginTop: -10, // Overlap effect
		backgroundColor: "#f5f7fa",
		paddingHorizontal: 5,
	},
	contactBtn: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "center",
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 20,
	},
	contactBtnText: {
		color: "#000",
		fontWeight: "600",
		marginLeft: 5,
	},
	// Bottom Nav
	bottomNav: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "#fff",
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 10,
		borderTopWidth: 1,
		borderTopColor: "#eee",
		paddingBottom: 20, // for Safe Area
	},
	navItem: {
		alignItems: "center",
	},
	navText: {
		fontSize: 10,
		marginTop: 4,
		color: "#999",
	},
});

export default App;
