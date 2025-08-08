/**
 * @generated SignedSource<<c22475c244b9e1d934528e700c123b6d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CompletePasskeyRegistrationInput = {
  email: string;
  name: string;
  passkeyName?: string | null | undefined;
  response: string;
};
export type SignUpPageCompleteRegistrationMutation$variables = {
  input: CompletePasskeyRegistrationInput;
};
export type SignUpPageCompleteRegistrationMutation$data = {
  readonly completePasskeyRegistration: {
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
export type SignUpPageCompleteRegistrationMutation = {
  response: SignUpPageCompleteRegistrationMutation$data;
  variables: SignUpPageCompleteRegistrationMutation$variables;
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
    "name": "completePasskeyRegistration",
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
    "name": "SignUpPageCompleteRegistrationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SignUpPageCompleteRegistrationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "26cafb4060cf4743af8c81ef83f28663",
    "id": null,
    "metadata": {},
    "name": "SignUpPageCompleteRegistrationMutation",
    "operationKind": "mutation",
    "text": "mutation SignUpPageCompleteRegistrationMutation(\n  $input: CompletePasskeyRegistrationInput!\n) {\n  completePasskeyRegistration(input: $input) {\n    token\n    user {\n      id\n      email\n      name\n      phone\n      avatarUrl\n    }\n    errors {\n      field\n      message\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a7008de910e34ab8061bede10542cbd5";

export default node;
