import {Registerable} from '@liaison/liaison';
import React from 'react';
import {view, useDelay} from '@liaison/react-integration';

export class Common extends Registerable() {
  @view() LoadingMessage() {
    return (
      <this.Delayed>
        <div>Loading...</div>
      </this.Delayed>
    );
  }

  @view() ErrorMessage({error, onRetry}) {
    const message = error?.displayMessage || 'Sorry, something went wrong.';

    return (
      <div className="alert alert-danger" style={{marginTop: '1rem'}} role="alert">
        <div>{message}</div>
        {onRetry && (
          <>
            <hr />
            <div>
              <button onClick={onRetry} className="btn btn-outline-danger">
                Retry
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  @view() RouteNotFound() {
    return <div>Sorry, there is nothing here.</div>;
  }

  @view() Delayed({duration = 200, children}) {
    const [isElapsed] = useDelay(duration);

    if (isElapsed) {
      return children;
    }

    return null;
  }
}
