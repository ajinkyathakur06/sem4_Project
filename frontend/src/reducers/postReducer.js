const initialState = {
  posts: [],
  comments: {},
  loading: false
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_POSTS':
      return { ...state, posts: action.payload, loading: false };
    case 'LOADING_POSTS':
      return { ...state, loading: true };
    case 'FETCH_COMMENTS':
      return { 
        ...state, 
        comments: { 
          ...state.comments, 
          [action.payload.postId]: action.payload.comments 
        } 
      };
    case 'ADD_COMMENT':
      const postId = action.payload.postId;
      return {
        ...state,
        comments: {
          ...state.comments,
          [postId]: [...(state.comments[postId] || []), action.payload.comment]
        },
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, comments_count: (post.comments_count || 0) + 1 }
            : post
        )
      };
    case 'SHARE_POST':
      return {
        ...state,
        posts: state.posts.map(post => 
          post.id === action.payload.postId 
            ? { ...post, shares_count: (post.shares_count || 0) + 1 }
            : post
        )
      };
    default:
      return state;
  }
};

export default postReducer;