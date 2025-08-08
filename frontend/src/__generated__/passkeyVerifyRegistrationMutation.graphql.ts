/**
 * @generated SignedSource<<c8b03c7155f70d99e77c6ccf9a308ce8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VerifyPasskeyRegistrationInput = {
  name?: string | null | undefined;
  response: string;
};
export type passkeyVerifyRegistrationMutation$variables = {
  input: VerifyPasskeyRegistrationInput;
};
export type passkeyVerifyRegistrationMutation$data = {
  readonly verifyPasskeyRegistration: {
    readonly createdAt: string;
    readonly id: string;
    readonly lastUsedAt: string | null | undefined;
    readonly name: string | null | undefined;
  };
};
export type passkeyVerifyRegistrationMutation = {
  response: passkeyVerifyRegistrationMutation$data;
  variables: passkeyVerifyRegistrationMutation$variables;
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
    "concreteType": "Passkey",
    "kind": "LinkedField",
    "name": "verifyPasskeyRegistration",
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
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createdAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "lastUsedAt",
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
    "name": "passkeyVerifyRegistrationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "passkeyVerifyRegistrationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b05030b051caf0608fc931a60957dc9c",
    "id": null,
    "metadata": {},
    "name": "passkeyVerifyRegistrationMutation",
    "operationKind": "mutation",
    "text": "mutation passkeyVerifyRegistrationMutation(\n  $input: VerifyPasskeyRegistrationInput!\n) {\n  verifyPasskeyRegistration(input: $input) {\n    id\n    name\n    createdAt\n    lastUsedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "7f6593da463162b38ee50215fba1f283";

export default node;
