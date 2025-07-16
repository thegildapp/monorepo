/**
 * @generated SignedSource<<c1016f3ea59bf05ed4a5650031604b8e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type LoginInput = {
  email: string;
  password: string;
};
export type authLoginMutation$variables = {
  input: LoginInput;
};
export type authLoginMutation$data = {
  readonly login: {
    readonly token: string;
    readonly user: {
      readonly avatarUrl: string | null | undefined;
      readonly email: string;
      readonly id: string;
      readonly name: string;
    };
  };
};
export type authLoginMutation = {
  response: authLoginMutation$data;
  variables: authLoginMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "login",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "token",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "authLoginMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authLoginMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "61cd114c3aafd39a40766d3bae29b9a7",
    "id": null,
    "metadata": {},
    "name": "authLoginMutation",
    "operationKind": "mutation",
    "text": "mutation authLoginMutation(\n  $input: LoginInput!\n) {\n  login(input: $input) {\n    token\n    user {\n      id\n      email\n      name\n      avatarUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "34fa8fc7ff11f9891de28523c80dfbab";

export default node;
