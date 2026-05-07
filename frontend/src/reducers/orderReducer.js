const initialState = {
  orders: [],
  loading: false
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOADING_ORDERS':
      return { ...state, loading: true };
    case 'FETCH_ORDERS':
      return { ...state, orders: action.payload, loading: false };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    default:
      return state;
  }
};

export default orderReducer;