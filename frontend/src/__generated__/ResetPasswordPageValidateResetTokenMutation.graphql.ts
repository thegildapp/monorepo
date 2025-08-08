/**
 * @generated SignedSource<<575fa13e3ace61e75c004c20a740825e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResetPasswordPageValidateResetTokenMutation$variables = {
  token: string;
};
export type ResetPasswordPageValidateResetTokenMutation$data = {
  readonly validatePasswordResetToken: {
    readonly errors: ReadonlyArray<{
      readonly code: string | null | undefined;
      readonly field: string | null | undefined;
      readonly message: string;
    }> | null | undefined;
    readonly user: {
      readonly email: string;
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly valid: boolean;
  };
};
export type ResetPasswordPageValidateResetTokenMutation = {
  response: ResetPasswordPageValidateResetTokenMutation$data;
  variables: ResetPasswordPageValidateResetTokenMutation$variables;
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
    "concreteType": "PasswordResetTokenValidation",
    "kind": "LinkedField",
    "name": "validatePasswordResetToken",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "valid",
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
    "name": "ResetPasswordPageValidateResetTokenMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResetPasswordPageValidateResetTokenMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e34d93e1bb3cb109ff1bd335dfc7ad92",
    "id": null,
    "metadata": {},
    "name": "ResetPasswordPageValidateResetTokenMutation",
    "operationKind": "mutation",
    "text": "mutation ResetPasswordPageValidateResetTokenMutation(\n  $token: String!\n) {\n  validatePasswordResetToken(token: $token) {\n    valid\n    user {\n      id\n      email\n      name\n    }\n    errors {\n      field\n      message\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fde79502e0d93992e5146ad1a9cd6a1d";

export default node;
