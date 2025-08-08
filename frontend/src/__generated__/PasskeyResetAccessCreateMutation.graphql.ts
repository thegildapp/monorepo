/**
 * @generated SignedSource<<d5c36da0a236c8486642cf182518f079>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PasskeyResetAccessCreateMutation$variables = {
  resetToken: string;
};
export type PasskeyResetAccessCreateMutation$data = {
  readonly createPasskeyWithResetToken: {
    readonly errors: ReadonlyArray<{
      readonly code: string | null | undefined;
      readonly field: string | null | undefined;
      readonly message: string;
    }> | null | undefined;
    readonly publicKey: string | null | undefined;
    readonly user: {
      readonly email: string;
      readonly id: string;
      readonly name: string;
    } | null | undefined;
  };
};
export type PasskeyResetAccessCreateMutation = {
  response: PasskeyResetAccessCreateMutation$data;
  variables: PasskeyResetAccessCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "resetToken"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "resetToken",
        "variableName": "resetToken"
      }
    ],
    "concreteType": "PasskeyResetPayload",
    "kind": "LinkedField",
    "name": "createPasskeyWithResetToken",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "publicKey",
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
    "name": "PasskeyResetAccessCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PasskeyResetAccessCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "98a879efcb3064458029f2409fe1c327",
    "id": null,
    "metadata": {},
    "name": "PasskeyResetAccessCreateMutation",
    "operationKind": "mutation",
    "text": "mutation PasskeyResetAccessCreateMutation(\n  $resetToken: String!\n) {\n  createPasskeyWithResetToken(resetToken: $resetToken) {\n    publicKey\n    user {\n      id\n      email\n      name\n    }\n    errors {\n      field\n      message\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3f485f540b171f9ac1d3e89cfd641662";

export default node;
