/**
 * @generated SignedSource<<01b6f5f8a65a5914c41d0d2fdc8b43b5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SignUpPageStartRegistrationMutation$variables = {
  email: string;
  name: string;
};
export type SignUpPageStartRegistrationMutation$data = {
  readonly startPasskeyRegistration: {
    readonly errors: ReadonlyArray<{
      readonly code: string | null | undefined;
      readonly field: string | null | undefined;
      readonly message: string;
    }> | null | undefined;
    readonly publicKey: string | null | undefined;
  } | null | undefined;
};
export type SignUpPageStartRegistrationMutation = {
  response: SignUpPageStartRegistrationMutation$data;
  variables: SignUpPageStartRegistrationMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "email",
        "variableName": "email"
      },
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "startPasskeyRegistration",
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
    "name": "SignUpPageStartRegistrationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SignUpPageStartRegistrationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7a85f0e0cf742afbf9426f0df5733d1d",
    "id": null,
    "metadata": {},
    "name": "SignUpPageStartRegistrationMutation",
    "operationKind": "mutation",
    "text": "mutation SignUpPageStartRegistrationMutation(\n  $email: String!\n  $name: String!\n) {\n  startPasskeyRegistration(email: $email, name: $name) {\n    publicKey\n    errors {\n      field\n      message\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6a6585996228207c61b02aa324783efa";

export default node;
