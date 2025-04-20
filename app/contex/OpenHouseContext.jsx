{/* רישום או סטטוס */}
{item.isRegistered ? (
  <>
    <Text style={styles.statusConfirmed}>
      ✔ רשום לסיור
    </Text>
    <TouchableOpacity
      style={styles.cancelButton}
      onPress={() => cancelRegistration(item.openHouseId)}
    >
      <Text style={styles.cancelText}>בטל רישום</Text>
    </TouchableOpacity>
  </>
) : isFull ? (
  <Text style={styles.fullMessage}>הסיור מלא</Text>
) : (
  <TouchableOpacity
    style={styles.registerButton}
    onPress={() => registerForOpenHouse(item.openHouseId)}
  >
    <Text style={styles.registerText}>להרשמה</Text>
  </TouchableOpacity>
              )}