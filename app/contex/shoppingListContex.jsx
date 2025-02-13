import React, { createContext, useState } from "react";

export const ShoppingListContext = createContext();

export const ShoppingListProvider = ({ children }) => {
  const [shoppingList, setShoppingList] = useState([
    { id: 1, name: 'Cucumber', amount: 5, active: false },
    { id: 2, name: 'Tomato', amount: 3, active: false },
    { id: 3, name: 'Potato', amount: 7, active: false },
    { id: 4, name: 'Carrot', amount: 2, active: false },
    { id: 5, name: 'Lettuce', amount: 4, active: false },
  ]);

  return (
    <ShoppingListContext.Provider value={{ shoppingList, setShoppingList }}>
      {children}
    </ShoppingListContext.Provider>
  );
};
