/**
 * @generated SignedSource<<2f2d2954b9d933f29105a6d4df3119fe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type authMeQuery$variables = Record<PropertyKey, never>;
export type authMeQuery$data = {
  readonly me: {
    readonly avatarUrl: string | null | undefined;
    readonly email: string;
    readonly id: string;
    readonly name: string;
  } | null | undefined;
};
export type authMeQuery = {
  response: authMeQuery$data;
  variables: authMeQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "me",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "email",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "avatarUrl",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "authMeQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "authMeQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "dc64865dd518c3eb0295fc8d7f2a4851",
    "id": null,
    "metadata": {},
    "name": "authMeQuery",
    "operationKind": "query",
    "text": "query authMeQuery {\n  me {\n    id\n    email\n    name\n    avatarUrl\n  }\n}\n"
  }
};
})();

(node as any).hash = "95a7ab0c586e719caec159f299e0f522";

export default node;
