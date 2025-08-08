/**
 * @generated SignedSource<<3855545f5e8205b6e4a7f493cc490ff7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VerifyEmailPageMutation$variables = {
  token: string;
};
export type VerifyEmailPageMutation$data = {
  readonly verifyEmail: {
    readonly errors: ReadonlyArray<{
      readonly code: string | null | undefined;
      readonly field: string | null | undefined;
      readonly message: string;
    }> | null | undefined;
    readonly token: string | null | undefined;
    readonly user: {
      readonly avatarUrl: string | null | undefined;
      readonly email: string;
      readonly id: string;
      readonly name: string;
      readonly phone: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type VerifyEmailPageMutation = {
  response: VerifyEmailPageMutation$data;
  variables: VerifyEmailPageMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "token"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "token",
        "variableName": "token"
      }
    ],
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "verifyEmail",
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
            "name": "phone",
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "FieldError",
        "kind": "LinkedField",
        "name": "errors",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "field",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "code",
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
    "name": "VerifyEmailPageMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VerifyEmailPageMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e65328616058f55e2117b388be43f7b9",
    "id": null,
    "metadata": {},
    "name": "VerifyEmailPageMutation",
    "operationKind": "mutation",
    "text": "mutation VerifyEmailPageMutation(\n  $token: String!\n) {\n  verifyEmail(token: $token) {\n    token\n    user {\n      id\n      email\n      name\n      phone\n      avatarUrl\n    }\n    errors {\n      field\n      message\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "04b9df1e4e914bad24ffd9a372ae0504";

export default node;
