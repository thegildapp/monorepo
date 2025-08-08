/**
 * @generated SignedSource<<7b87a05a404edbdc29c2f305ddcdd5c5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ForgotPasswordPageRequestPasswordResetMutation$variables = {
  email: string;
};
export type ForgotPasswordPageRequestPasswordResetMutation$data = {
  readonly requestPasswordReset: {
    readonly errors: ReadonlyArray<{
      readonly code: string | null | undefined;
      readonly field: string | null | undefined;
      readonly message: string;
    }> | null | undefined;
    readonly message: string;
    readonly success: boolean;
  };
};
export type ForgotPasswordPageRequestPasswordResetMutation = {
  response: ForgotPasswordPageRequestPasswordResetMutation$data;
  variables: ForgotPasswordPageRequestPasswordResetMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "email",
        "variableName": "email"
      }
    ],
    "concreteType": "PasswordResetRequestPayload",
    "kind": "LinkedField",
    "name": "requestPasswordReset",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
        "storageKey": null
      },
      (v1/*: any*/),
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
          (v1/*: any*/),
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
    "name": "ForgotPasswordPageRequestPasswordResetMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ForgotPasswordPageRequestPasswordResetMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "58c0508992a442105712b5c63ce950d0",
    "id": null,
    "metadata": {},
    "name": "ForgotPasswordPageRequestPasswordResetMutation",
    "operationKind": "mutation",
    "text": "mutation ForgotPasswordPageRequestPasswordResetMutation(\n  $email: String!\n) {\n  requestPasswordReset(email: $email) {\n    success\n    message\n    errors {\n      field\n      message\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6fe92bd003f75bf6d531d16830165f30";

export default node;
