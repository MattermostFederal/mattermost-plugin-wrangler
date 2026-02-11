import React from 'react';

import {Action, Store} from 'redux';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHatCowboy} from '@fortawesome/free-solid-svg-icons';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {isCombinedUserActivityPost} from 'mattermost-redux/utils/post_list';
import {isSystemMessage} from 'mattermost-redux/utils/post_utils';
import {getPostThread} from 'mattermost-redux/actions/posts';

import {
    getSettings,
    startCopyToChannel,
    openMoveThreadModal,
    copyThread,
    startAttachingPost,
    finishAttachingPost,
    attachMessage,
    startMergingThread,
    finishMergingThread,
    mergeThread,
} from './actions';
import {getChannelToCopyTo, getPostToBeAttached, getMergeThreadPost} from './selectors';
import reducer from './reducers';

import SetupUI from './components/setup_ui';
import MoveThreadModal from './components/move_thread_modal';
import LeftSidebarAttachMessage from './components/left_sidebar_attach_message';
import LeftSidebarCopyToChannel from './components/left_sidebar_copy_to_channel';
import LeftSidebarMergeThread from './components/left_sidebar_merge_thread';

const isSystemPost = (state: any, postId: string): boolean => {
    const post = getPost(state, postId);
    if (!post) {
        return true;
    }
    return isCombinedUserActivityPost(postId) || isSystemMessage(post);
};

const setupUILater = (registry: any, store: Store<object, Action<object>>): () => Promise<void> => async () => {
    registry.registerReducer(reducer);

    const settings = await store.dispatch(getSettings());

    if (settings.data.enable_web_ui) {
        registry.registerRootComponent(MoveThreadModal);
        registry.registerLeftSidebarHeaderComponent(LeftSidebarCopyToChannel);

        // Move/Copy Thread
        registry.registerPostDropdownMenuAction(
            <><FontAwesomeIcon className='MenuItem__icon' icon={faHatCowboy}/>{'Move/Copy Thread'}</>,
            async (postId: string) => {
                const state = store.getState() as any;
                let rootPostID = postId;
                const post = getPost(state, postId);
                if (post && post.root_id) {
                    rootPostID = post.root_id;
                    const rootPost = getPost(state, rootPostID);
                    if (!rootPost) {
                        await store.dispatch(getPostThread(rootPostID) as any);
                    }
                }
                store.dispatch(openMoveThreadModal(rootPostID) as any);
            },
            (postId: string) => !isSystemPost(store.getState(), postId),
        );

        // Copy to Channel
        registry.registerPostDropdownMenuAction(
            <><FontAwesomeIcon className='MenuItem__icon' icon={faHatCowboy}/>{'Copy to Channel'}</>,
            (postId: string) => {
                const targetChannel = getChannelToCopyTo(store.getState() as any);
                if (targetChannel) {
                    store.dispatch(copyThread(postId, targetChannel.id) as any);
                }
            },
            (postId: string) => {
                const state = store.getState() as any;
                if (isSystemPost(state, postId)) {
                    return false;
                }
                const post = getPost(state, postId);
                if (!post) {
                    return false;
                }
                const targetChannel = getChannelToCopyTo(state);
                if (!targetChannel) {
                    return false;
                }
                return post.channel_id !== targetChannel.id;
            },
        );

        registry.registerChannelHeaderMenuAction(
            'Copy Messages to Channel',
            (channelId: string) => store.dispatch(startCopyToChannel(getChannel(store.getState(), channelId)) as any),
        );

        // Merging threads has the same functionality as attaching messages, so
        // only present one option to users.
        if (settings.data.enable_merge_thread) {
            registry.registerLeftSidebarHeaderComponent(LeftSidebarMergeThread);

            // Merge to Thread (start step)
            registry.registerPostDropdownMenuAction(
                <><FontAwesomeIcon className='MenuItem__icon' icon={faHatCowboy}/>{'Merge to Thread'}</>,
                (postId: string) => {
                    const state = store.getState() as any;
                    let post = getPost(state, postId);
                    if (post && post.root_id !== '') {
                        post = getPost(state, post.root_id);
                    }
                    if (post) {
                        const user = getUser(state, post.user_id);
                        const channel = getChannel(state, post.channel_id);
                        store.dispatch(startMergingThread({post, user, channel}) as any);
                    }
                },
                (postId: string) => {
                    const state = store.getState() as any;
                    if (isSystemPost(state, postId)) {
                        return false;
                    }
                    return !getMergeThreadPost(state);
                },
            );

            // Merge to this Thread (complete step)
            registry.registerPostDropdownMenuAction(
                <><FontAwesomeIcon className='MenuItem__icon' icon={faHatCowboy}/>{'Merge to this Thread'}</>,
                (postId: string) => {
                    const state = store.getState() as any;
                    const mergePost = getMergeThreadPost(state);
                    let post = getPost(state, postId);
                    if (post && post.root_id !== '') {
                        post = getPost(state, post.root_id);
                    }
                    if (mergePost && post) {
                        store.dispatch(mergeThread(mergePost.post.id, post.id) as any);
                        store.dispatch(finishMergingThread() as any);
                    }
                },
                (postId: string) => {
                    const state = store.getState() as any;
                    if (isSystemPost(state, postId)) {
                        return false;
                    }
                    const mergePost = getMergeThreadPost(state);
                    if (!mergePost) {
                        return false;
                    }
                    let post = getPost(state, postId);
                    if (!post) {
                        return false;
                    }
                    if (post.root_id !== '') {
                        post = getPost(state, post.root_id);
                        if (!post) {
                            return false;
                        }
                    }
                    if (post.id === mergePost.post.id) {
                        return false;
                    }
                    return post.create_at < mergePost.post.create_at;
                },
            );
        } else {
            registry.registerLeftSidebarHeaderComponent(LeftSidebarAttachMessage);

            // Attach to Thread (start step)
            registry.registerPostDropdownMenuAction(
                <><FontAwesomeIcon className='MenuItem__icon' icon={faHatCowboy}/>{'Attach to Thread'}</>,
                (postId: string) => {
                    const state = store.getState() as any;
                    const post = getPost(state, postId);
                    if (post) {
                        const user = getUser(state, post.user_id);
                        const channel = getChannel(state, post.channel_id);
                        store.dispatch(startAttachingPost({post, user, channel}) as any);
                    }
                },
                (postId: string) => {
                    const state = store.getState() as any;
                    if (isSystemPost(state, postId)) {
                        return false;
                    }
                    if (getPostToBeAttached(state)) {
                        return false;
                    }
                    const post = getPost(state, postId);
                    if (!post) {
                        return false;
                    }
                    return !state.entities.posts.postsInThread[post.id] && post.root_id === '';
                },
            );

            // Attach to this Thread (complete step)
            registry.registerPostDropdownMenuAction(
                <><FontAwesomeIcon className='MenuItem__icon' icon={faHatCowboy}/>{'Attach to this Thread'}</>,
                (postId: string) => {
                    const state = store.getState() as any;
                    const attachPost = getPostToBeAttached(state);
                    const post = getPost(state, postId);
                    if (attachPost && post) {
                        store.dispatch(attachMessage(attachPost.post.id, post.id) as any);
                        store.dispatch(finishAttachingPost() as any);
                    }
                },
                (postId: string) => {
                    const state = store.getState() as any;
                    if (isSystemPost(state, postId)) {
                        return false;
                    }
                    const attachPost = getPostToBeAttached(state);
                    if (!attachPost) {
                        return false;
                    }
                    const post = getPost(state, postId);
                    if (!post) {
                        return false;
                    }
                    if (post.id === attachPost.post.id) {
                        return false;
                    }
                    const channel = getChannel(state, post.channel_id);
                    if (!channel || channel.id !== attachPost.channel.id) {
                        return false;
                    }
                    return post.create_at <= attachPost.post.create_at;
                },
            );
        }
    }
};

export default class Plugin {
    private haveSetupUI = false;
    private setupUI?: () => Promise<void>;

    private finishedSetupUI = () => {
        this.haveSetupUI = true;
    };

    public async initialize(registry: any, store: Store<object, Action<object>>) {
        this.setupUI = setupUILater(registry, store);
        this.haveSetupUI = false;

        // Register the dummy component, which will call setupUI when it is activated (i.e., when the user logs in)
        registry.registerRootComponent(
            () => {
                return (
                    <SetupUI
                        setupUI={this.setupUI}
                        haveSetupUI={this.haveSetupUI}
                        finishedSetupUI={this.finishedSetupUI}
                    />
                );
            },
        );
    }
}
