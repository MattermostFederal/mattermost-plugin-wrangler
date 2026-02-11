---
name: redux-patterns
description: Redux state management patterns for React applications. Use when working with Redux actions, reducers, selectors, thunks, and state architecture.
---

# Redux State Management Patterns

## When to Use This Skill

- Implementing Redux actions and reducers
- Creating selectors with reselect/memoization
- Working with async actions (thunks)
- Designing state shape and normalization
- Debugging Redux state issues
- Optimizing Redux performance

## Core Patterns

### Actions & Action Creators

```typescript
// Action types as const
export const FETCH_CHANNELS_REQUEST = 'FETCH_CHANNELS_REQUEST';
export const FETCH_CHANNELS_SUCCESS = 'FETCH_CHANNELS_SUCCESS';
export const FETCH_CHANNELS_FAILURE = 'FETCH_CHANNELS_FAILURE';

// Type-safe action creators
export interface FetchChannelsRequestAction {
    type: typeof FETCH_CHANNELS_REQUEST;
    teamId: string;
}

export interface FetchChannelsSuccessAction {
    type: typeof FETCH_CHANNELS_SUCCESS;
    data: Channel[];
}

export type ChannelActionTypes =
    | FetchChannelsRequestAction
    | FetchChannelsSuccessAction
    | FetchChannelsFailureAction;

// Action creator
export function fetchChannelsSuccess(data: Channel[]): FetchChannelsSuccessAction {
    return {
        type: FETCH_CHANNELS_SUCCESS,
        data,
    };
}
```

### Thunks (Async Actions)

```typescript
export function fetchChannels(teamId: string): ThunkAction<void, GlobalState, unknown, AnyAction> {
    return async (dispatch, getState) => {
        dispatch({ type: FETCH_CHANNELS_REQUEST, teamId });

        try {
            const channels = await Client.getChannels(teamId);
            dispatch(fetchChannelsSuccess(channels));
        } catch (error) {
            dispatch({ type: FETCH_CHANNELS_FAILURE, error });
        }
    };
}
```

### Reducers

```typescript
const initialState: WranglerState = {
    channels: {},
    loading: false,
    error: null,
};

export function wranglerReducer(
    state = initialState,
    action: WranglerActionTypes
): WranglerState {
    switch (action.type) {
        case FETCH_CHANNELS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_CHANNELS_SUCCESS:
            return {
                ...state,
                loading: false,
                channels: {
                    ...state.channels,
                    ...action.data.reduce((acc, channel) => {
                        acc[channel.id] = channel;
                        return acc;
                    }, {} as Record<string, Channel>),
                },
            };

        default:
            return state;
    }
}
```

### Selectors with Memoization

```typescript
import { createSelector } from 'reselect';

// Base selectors
export const getWranglerState = (state: GlobalState) => state['plugins-com.mattermost.wrangler'];
export const getChannels = (state: GlobalState) => getWranglerState(state).channels;

// Memoized selector
export const getChannelsForTeam = createSelector(
    [getChannels, (state: GlobalState, teamId: string) => teamId],
    (channels, teamId) => {
        return Object.values(channels).filter(
            channel => channel.teamId === teamId
        );
    }
);
```

### State Normalization

```typescript
// Normalized state shape
interface NormalizedState {
    entities: {
        channels: Record<string, Channel>;
        posts: Record<string, Post>;
    };
    ui: {
        selectedPostId: string | null;
        isLoading: boolean;
    };
}
```

## Best Practices

1. **Keep state normalized** - Use IDs as keys, avoid nested structures
2. **Derive data with selectors** - Don't store computed values
3. **Use memoized selectors** - Prevent unnecessary re-renders
4. **Immutable updates** - Always return new state objects
5. **Action naming** - Use NOUN_VERB pattern (CHANNELS_FETCH_SUCCESS)
6. **Separate concerns** - UI state vs entity state vs request state
7. **Type everything** - Full TypeScript coverage for actions/state

## Common Patterns in This Codebase

### Wrangler Redux Patterns
- Actions in `webapp/src/actions/`
- Reducers in `webapp/src/reducers/`
- Selectors in `webapp/src/selectors/`
- Types in `webapp/src/types/`

### Connect Pattern
```typescript
const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
    channels: getChannelsForTeam(state, ownProps.teamId),
    loading: getLoading(state),
});

const mapDispatchToProps = {
    fetchChannels,
    moveThread,
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveThreadModal);
```

### Hooks Pattern (Modern)
```typescript
function MoveThreadModal({ teamId }: Props) {
    const dispatch = useDispatch();
    const channels = useSelector((state) => getChannelsForTeam(state, teamId));
    const loading = useSelector(getLoading);

    useEffect(() => {
        dispatch(fetchChannels(teamId));
    }, [dispatch, teamId]);

    return <div>{/* render channels */}</div>;
}
```

---

## Redux Toolkit (RTK) Patterns

Modern Redux uses Redux Toolkit for less boilerplate and better DX.

### createSlice (Recommended)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WranglerState {
    channels: Record<string, Channel>;
    loading: boolean;
    error: string | null;
}

const initialState: WranglerState = {
    channels: {},
    loading: false,
    error: null,
};

const wranglerSlice = createSlice({
    name: 'wrangler',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        channelReceived(state, action: PayloadAction<Channel>) {
            state.channels[action.payload.id] = action.payload;
        },
        channelsReceived(state, action: PayloadAction<Channel[]>) {
            action.payload.forEach(channel => {
                state.channels[channel.id] = channel;
            });
        },
    },
});

export const { setLoading, channelReceived, channelsReceived } = wranglerSlice.actions;
export default wranglerSlice.reducer;
```

### createAsyncThunk

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchChannels = createAsyncThunk(
    'wrangler/fetchChannels',
    async (teamId: string, { rejectWithValue }) => {
        try {
            const channels = await Client.getChannels(teamId);
            return channels;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Handle in slice with extraReducers:
const wranglerSlice = createSlice({
    name: 'wrangler',
    initialState,
    reducers: { /* ... */ },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChannels.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChannels.fulfilled, (state, action) => {
                state.loading = false;
                action.payload.forEach(channel => {
                    state.channels[channel.id] = channel;
                });
            })
            .addCase(fetchChannels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});
```

### When to Use RTK vs Legacy

| Scenario | Recommendation |
|----------|----------------|
| New features | Use RTK (createSlice, createAsyncThunk) |
| Existing MM code | Follow existing patterns for consistency |
| API-heavy features | Consider RTK Query |
| Simple state | createSlice is sufficient |
| Complex async flows | createAsyncThunk with extraReducers |
