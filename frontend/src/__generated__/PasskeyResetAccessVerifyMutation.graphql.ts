/**
 * @generated SignedSource<<3825f53fb05db33dcd079c0a4dc234a6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PasskeyResetAccessVerifyMutation$variables = {
  name?: string | null | undefined;
  resetToken: string;
  response: string;
};
export type PasskeyResetAccessVerifyMutation$data = {
  readonly verifyPasskeyWithResetToken: {
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
  };
};
export type PasskeyResetAccessVerifyMutation = {
  response: PasskeyResetAccessVerifyMutation$data;
  variables: PasskeyResetAccessVerifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resetToken"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "response"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      },
      {
        "kind": "Variable",
        "name": "resetToken",
        "variableName": "resetToken"
      },
      {
        "kind": "Variable",
        "name": "response",
        "variableName": "response"
      }
    ],
    "concreteType": "PasswordResetPayload",
    "kind": "LinkedField",
    "name": "verifyPasskeyWithResetToken",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PasskeyResetAccessVerifyMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "PasskeyResetAccessVerifyMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "28c9add1b4f809a8e1faf221c2af7020",
    "id": null,
    "metadata": {},
    "name": "PasskeyResetAccessVerifyMutation",
    "operationKind": "mutation",
    "text": "mutation PasskeyResetAccessVerifyMutation(\n  $resetToken: String!\n  $response: String!\n  $name: String\n) {\n  verifyPasskeyWithResetToken(resetToken: $resetToken, response: $response, name: $name) {\n    token\n    user {\n      id\n      email\n      name\n      phone\n      avatarUrl\n    }\n    errors {\n      field\n      message\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d34677ecc5b439375f78308733cd53bd";

export default node;
