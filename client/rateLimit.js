import { onError } from "@apollo/client/link/error";
import Observable from "zen-observable";

function isThrottledError(error) {
  return error.extensions.code === "THROTTLED";
}

function exceedsMaximumCost(cost) {
  const {
    requestedQueryCost,
    actualQueryCost,
    throttleStatus: { maximumAvailable },
  } = cost;
  const requested = actualQueryCost || requestedQueryCost;

  return requested > maximumAvailable;
}

function calculateDelayCost(cost) {
  const {
    requestedQueryCost,
    actualQueryCost,
    throttleStatus: { currentlyAvailable, restoreRate },
  } = cost;

  const requested = actualQueryCost || requestedQueryCost;
  const restoreAmount = Math.max(0, requested - currentlyAvailable);
  const msToWait = Math.ceil(restoreAmount / restoreRate) * 1000;

  return msToWait;
}

function delay(msToWait) {
  return new Observable((observer) => {
    let timer = setTimeout(() => {
      observer.complete();
    }, msToWait);

    return () => clearTimeout(timer);
  });
}

const rateLimit = onError(
  ({ graphQLErrors, networkError, forward, operation, response }) => {
    if (networkError) {
      // A non 429 connection error.
      // Fallback to ApolloClient's own error handler.
      return;
    }

    if (!graphQLErrors) {
      // An error we cannot respond to with rate limit handling. We require a specific error extension.
      // Fallback to ApolloClient's own error handler.
      return;
    }

    if (!graphQLErrors.some(isThrottledError)) {
      // There was no throttling for this request.
      // Fallback to ApolloClient's own error handler.
      return;
    }

    const cost = response.extensions.cost;

    if (!cost) {
      // We require the cost extension to calculate the delay.
      // Fallback to ApolloClient's own error handler.
      return;
    }

    if (exceedsMaximumCost(cost)) {
      // Your query costs more than the maximum allowed cost.
      // Fallback to ApolloClient's own error handler.
      return;
    }
    const msToWait = calculateDelayCost(cost);
    operation.setContext({ retry: true, msToWait });

    return delay(msToWait).concat(forward(operation));
  }
);

export default rateLimit;
