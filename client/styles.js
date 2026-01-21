import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  headerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  header: { padding: 16 },
  screenTitle: { fontSize: 28, fontWeight: 'bold' },
  
  // Search & Filters
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: '#E0E0E0' },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },
  filtersRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  filterBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E0E0E0' },
  filterBtnActive: { backgroundColor: '#C4C4C4' },
  filterText: { color: '#000' },
  filterTextActive: { fontWeight: '600', color: '#000' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },

  // Lists & Cards
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#CCC' },
  masterInfo: { marginLeft: 12, justifyContent: 'center' },
  masterName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  ratingText: { fontSize: 14, color: '#000', marginTop: 2, fontWeight: '600' },
  reviewsText: { color: '#666', fontWeight: '400' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
  tag: { backgroundColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, color: '#333' },

  galleryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  galleryPlaceholder: { width: '31%', aspectRatio: 1, backgroundColor: '#D1D1D1', borderRadius: 4 },

  footerInfo: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 13, color: '#333' },

  // Master Profile
  navHeader: { flexDirection: 'row', justifyContent:'space-between', padding: 16 },
  detailName: { fontSize: 24, fontWeight: 'bold' },
  mapPlaceholder: { height: 80, backgroundColor: '#CCC', borderRadius: 8, marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, marginTop: 10 },
  
  calendarRow: { flexDirection: 'row', justifyContent:'space-between', marginBottom: 15 },
  dateBox: { width: '23%', aspectRatio: 1, borderWidth: 1, borderColor: '#CCC', borderRadius: 10, justifyContent:'center', alignItems:'center', backgroundColor: '#FFF' },
  dateBoxActive: { backgroundColor: '#999', borderColor: '#999' },
  dateText: { textAlign: 'center', fontSize: 12 },

  timePickerRow: { flexDirection: 'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#DDD', padding: 10, borderRadius: 8, marginBottom: 15 },
  timeSelect: { flexDirection:'row', backgroundColor:'#FFF', padding: 5, borderRadius: 4, alignItems:'center', gap: 5, minWidth: 80, justifyContent:'center' },
  
  primaryBtn: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 25, alignItems:'center', justifyContent:'center' },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { backgroundColor: '#999', paddingVertical: 14, borderRadius: 25, alignItems:'center', justifyContent:'center' },
  secondaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#EEE' },
  serviceName: { fontSize: 16 },
  servicePrice: { fontWeight: '600' },
  
  stickyFooter: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', padding: 16, backgroundColor: '#F2F2F2', borderTopWidth: 1, borderColor: '#DDD' },

  // Bookings
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  tabBtnActive: { backgroundColor: '#666' },
  bookingActions: { flexDirection: 'row', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderColor: '#F0F0F0' },

  // Chat
  chatRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EEE' },
  badge: { backgroundColor: '#000', width: 20, height: 20, borderRadius: 10, justifyContent:'center', alignItems:'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight:'bold' },
  
  inputContainer: { flexDirection:'row', padding: 10, backgroundColor:'#FFF', alignItems:'center', borderTopWidth:1, borderColor:'#EEE' },
  chatInput: { flex:1, backgroundColor:'#F2F2F2', borderRadius:20, paddingHorizontal:15, paddingVertical:10, maxHeight:100, fontSize:16 },
  sendButton: { width:40, height:40, borderRadius:20, backgroundColor:'#000', justifyContent:'center', alignItems:'center', marginLeft:10 },
  messageBubble: { maxWidth:'80%', padding:12, borderRadius:16, marginBottom:10 },
  myMessage: { alignSelf:'flex-end', backgroundColor:'#000', borderBottomRightRadius:0 },
  theirMessage: { alignSelf:'flex-start', backgroundColor:'#FFF', borderBottomLeftRadius:0 },
  messageText: { fontSize:16 },
  messageTime: { fontSize:10, marginTop:4, alignSelf:'flex-end' },

  // Profile
  loyaltyCard: { backgroundColor: '#C4C4C4', borderRadius: 12, padding: 20, height: 160, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#E0E0E0' },

  // Modals
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalContent: { width:'80%', backgroundColor:'#FFF', borderRadius:20, padding:20, maxHeight:'50%' },
  modalTitle: { fontSize:20, fontWeight:'bold', marginBottom:20, textAlign:'center' },
  timeSlotItem: { flex:1, margin:5, backgroundColor:'#F2F2F2', padding:15, borderRadius:10, alignItems:'center' }
});