import {Component, provide} from '@liaison/component';
import {Storable} from '@liaison/storable';
import {ComponentHTTPClient} from '@liaison/component-http-client';

import {Root} from './root';
import {getApp} from './app';
import {Home} from './home';
import {Session} from './session';
import {User} from './user';
import {ArticleList} from './article-list';
import {Article} from './article';
import {CommentList} from './comment-list';
import {Comment} from './comment';
import {Common} from './common';

export const getFrontend = async ({backendURL}) => {
  const client = new ComponentHTTPClient(backendURL, {mixins: [Storable]});

  const Backend = await client.getComponent();

  class Frontend extends Component {
    @provide() static Root = Root;
    @provide() static App = getApp({
      name: 'Conduit',
      description: 'A place to share your knowledge.'
    });
    @provide() static Home = Home;
    @provide() static Session = Session(Backend.Session);
    @provide() static User = User(Backend.User);
    @provide() static ArticleList = ArticleList;
    @provide() static Article = Article(Backend.Article);
    @provide() static CommentList = CommentList;
    @provide() static Comment = Comment(Backend.Comment);
    @provide() static Common = Common;
  }

  return Frontend;
};
