import React from 'react';
import {view, useAsyncMemo} from '@liaison/react-integration';
import {Entity as BaseEntity} from '@liaison/react-liaison-realworld-example-app-shared';

export class Entity extends BaseEntity {
  @view() static Loader({query, fields, children}) {
    const {common} = this.$layer;

    const [entity, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      try {
        return await this.$get(query, {fields});
      } catch (error) {
        error.displayMessage = `Sorry, something went wrong while loading the ${this.$getRegisteredName().toLowerCase()} information.`;
        throw error;
      }
    }, [JSON.stringify(query), JSON.stringify(fields)]);

    if (isLoading) {
      return <common.LoadingMessage />;
    }

    if (loadingError) {
      return <common.ErrorMessage error={loadingError} onRetry={retryLoading} />;
    }

    return children(entity);
  }
}
