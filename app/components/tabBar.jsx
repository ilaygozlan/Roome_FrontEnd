import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Entypo, Feather,Ionicons, MaterialIcons } from '@expo/vector-icons';

/**
 * @component TabBar
 * @description Custom navigation tab bar component for the application's bottom navigation.
 * Provides a styled tab bar with icons and labels for main navigation routes.
 * 
 * Features:
 * - Custom styled tab bar with shadow and rounded corners
 * - Icon-based navigation
 * - Active/inactive state styling
 * - Accessibility support
 * - Deep linking support through href building
 * 
 * Navigation Routes:
 * - Home (index)
 * - Profile (ProfilePage)
 * - For You (ForYou)
 * - Maps (maps)
 * - Edit (Edit)
 * 
 * @param {Object} props
 * @param {Object} props.state - Navigation state
 * @param {Object} props.descriptors - Route descriptors
 * @param {Object} props.navigation - Navigation object
 */

const TabBar = ({ state, descriptors, navigation }) => {

  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  /**
   * Icon mapping for different routes
   * @constant
   * @type {Object.<string, Function>}
   */
  const icons = {
    index: (props) => <AntDesign name="home" size={24} {...props} />,
    ProfilePage: (props) => <Ionicons name="person-outline" size={24} {...props} />,
    ForYou: (props) => <Ionicons name="fast-food-outline" size={24} {...props} />,
    maps: (props) => <Ionicons name="map-outline" size={24} {...props} />,
    Edit: (props) => <Entypo name="add-to-list" size={24} {...props} />
  };

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        if(['_sitmap', '+not-found'].includes(route.name)) return null;
        const isFocused = state.index === index;
      
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            style={styles.tabbarItem}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
          {
  icons[route.name] ? icons[route.name]({ color: isFocused ? "#2F74FF" : colors.text }) : null
}

            <Text style={{ color: isFocused ? "#2F74FF" : colors.text , fontSize: 11}}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  )
}

/**
 * Styles for the tab bar and its items
 * @constant
 * @type {Object}
 */
const styles = StyleSheet.create({
  tabbar : {
    position : 'absolute',
    bottom : 25,
    flexDirection : 'row',
    justifyContent : "space-between",
    alignForYou: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderCurve: 'continuous',
    shadowColor: 'black',
    shadowOffset: {width: 0 , height: 10},
    shadowRadius: 10,
    shadowOpacity: 0.1
  },
  tabbarItem:{
    flex: 1,
    justifyContent: 'center',
    alignForYou: 'center',
    gap: 4
  }
})
export default TabBar