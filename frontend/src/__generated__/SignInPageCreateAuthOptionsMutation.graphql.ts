/**
 * @generated SignedSource<<489bf84d9c2cebc76fe33c3abf3ba30f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SignInPageCreateAuthOptionsMutation$variables = {
  email: string;
};
export type SignInPageCreateAuthOptionsMutation$data = {
  readonly createPasskeyAuthenticationOptions: {
    readonly errors: ReadonlyArray<{
      readonly code: string | null | undefined;
      readonly field: string | null | undefined;
      readonly message: string;
    }> | null | undefined;
    readonly publicKey: string | null | undefined;
  } | null | undefined;
};
export type SignInPageCreateAuthOptionsMutation = {
  response: SignInPageCreateAuthOptionsMutation$data;
  variables: SignInPageCreateAuthOptionsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
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
      }
    ],
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "createPasskeyAuthenticationOptions",
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
    "name": "SignInPageCreateAuthOptionsMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SignInPageCreateAuthOptionsMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "68f9cab9eebcd89e74aebf8f9eeeb7c9",
    "id": null,
    "metadata": {},
    "name": "SignInPageCreateAuthOptionsMutation",
    "operationKind": "mutation",
    "text": "mutation SignInPageCreateAuthOptionsMutation(\n  $email: String!\n) {\n  createPasskeyAuthenticationOptions(email: $email) {\n    publicKey\n    errors {\n      field\n      message\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5986f8adb8755a487c02b403470b3472";

export default node;
