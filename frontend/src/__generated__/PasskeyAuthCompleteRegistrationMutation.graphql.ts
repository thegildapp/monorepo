/**
 * @generated SignedSource<<ca95b89000ebf49a40eb013f4881736d>>
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
export type PasskeyAuthCompleteRegistrationMutation$variables = {
  input: CompletePasskeyRegistrationInput;
};
export type PasskeyAuthCompleteRegistrationMutation$data = {
  readonly completePasskeyRegistration: {
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
export type PasskeyAuthCompleteRegistrationMutation = {
  response: PasskeyAuthCompleteRegistrationMutation$data;
  variables: PasskeyAuthCompleteRegistrationMutation$variables;
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
    "name": "PasskeyAuthCompleteRegistrationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PasskeyAuthCompleteRegistrationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "77ae8379ab68c0bcf5520267d4a5efda",
    "id": null,
    "metadata": {},
    "name": "PasskeyAuthCompleteRegistrationMutation",
    "operationKind": "mutation",
    "text": "mutation PasskeyAuthCompleteRegistrationMutation(\n  $input: CompletePasskeyRegistrationInput!\n) {\n  completePasskeyRegistration(input: $input) {\n    token\n    user {\n      id\n      email\n      name\n      phone\n      avatarUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "48affd1fdd3b158190eea09c52986b8a";

export default node;
