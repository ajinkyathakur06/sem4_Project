const initialState = {
  items: [],
  total: 0,
  loading: false
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOADING_CART':
      return { ...state, loading: true };
    case 'FETCH_CART':
      const total = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: action.payload, total, loading: false };
    case 'ADD_TO_CART':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_CART_ITEM':
      const updatedItems = state.items.map(item => 
        item.id === action.payload.itemId 
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: updatedItems, total: newTotal };
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const filteredTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: filteredItems, total: filteredTotal };
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 };
    default:
      return state;
  }
};

export default cartReducer;