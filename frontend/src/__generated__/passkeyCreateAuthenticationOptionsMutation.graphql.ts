/**
 * @generated SignedSource<<35630b93b70e4cfa40987086b3317076>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type passkeyCreateAuthenticationOptionsMutation$variables = {
  email: string;
};
export type passkeyCreateAuthenticationOptionsMutation$data = {
  readonly createPasskeyAuthenticationOptions: {
    readonly publicKey: string | null | undefined;
  } | null | undefined;
};
export type passkeyCreateAuthenticationOptionsMutation = {
  response: passkeyCreateAuthenticationOptionsMutation$data;
  variables: passkeyCreateAuthenticationOptionsMutation$variables;
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
    "name": "passkeyCreateAuthenticationOptionsMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "passkeyCreateAuthenticationOptionsMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "03c6da1ad6257e855e2ce4049beeb7d7",
    "id": null,
    "metadata": {},
    "name": "passkeyCreateAuthenticationOptionsMutation",
    "operationKind": "mutation",
    "text": "mutation passkeyCreateAuthenticationOptionsMutation(\n  $email: String!\n) {\n  createPasskeyAuthenticationOptions(email: $email) {\n    publicKey\n  }\n}\n"
  }
};
})();

(node as any).hash = "ee2734772e9894e740f1dfdf412f9b48";

export default node;
