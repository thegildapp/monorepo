import { Environment, Network, RecordSource, Store } from 'relay-runtime';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

async function fetchQuery(operation: any, variables: any) {
  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  });

  return response.json();
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;