import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Entypo, Feather,Ionicons, MaterialIcons } from '@expo/vector-icons';

const TabBar = ({ state, descriptors, navigation }) => {

  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const icons = {
    index: (props)=> <AntDesign name="home" size={24} color={colors.primary} {...props} />,
    ProfilePage: (props)=> <Ionicons name="person-outline" size={24} color={colors.primary} {...props} />,
    Items: (props)=> <Ionicons name="fast-food-outline" size={24} color={colors.primary} {...props} />,
    Edit: (props)=> <Entypo name="add-to-list" size={24} color={colors.primary} {...props} />
  }

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
              icons[route.name]({
                color: isFocused? "#27ae60" : colors.text
              })
            }
            <Text style={{ color: isFocused ? "#27ae60" : colors.text , fontSize: 11}}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabbar : {
    position : 'absolute',
    bottom : 25,
    flexDirection : 'row',
    justifyContent : "space-between",
    alignItems: 'center',
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
    alignItems: 'center',
    gap: 4
  }
})
export default TabBar