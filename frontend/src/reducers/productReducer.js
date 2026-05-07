const initialState = {
  products: [],
  loading: false
};

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    case 'LOADING_PRODUCTS':
      return { ...state, loading: true };
    default:
      return state;
  }
};

export default productReducer;