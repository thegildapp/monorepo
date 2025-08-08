/**
 * @generated SignedSource<<ca43c22082567ed49af31a9ff42983f9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type passkeyCreateRegistrationOptionsMutation$variables = Record<PropertyKey, never>;
export type passkeyCreateRegistrationOptionsMutation$data = {
  readonly createPasskeyRegistrationOptions: {
    readonly publicKey: string | null | undefined;
  } | null | undefined;
};
export type passkeyCreateRegistrationOptionsMutation = {
  response: passkeyCreateRegistrationOptionsMutation$data;
  variables: passkeyCreateRegistrationOptionsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "createPasskeyRegistrationOptions",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "passkeyCreateRegistrationOptionsMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "passkeyCreateRegistrationOptionsMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "2c9e97f9224a50a932b3d2def52701c9",
    "id": null,
    "metadata": {},
    "name": "passkeyCreateRegistrationOptionsMutation",
    "operationKind": "mutation",
    "text": "mutation passkeyCreateRegistrationOptionsMutation {\n  createPasskeyRegistrationOptions {\n    publicKey\n  }\n}\n"
  }
};
})();

(node as any).hash = "4f867657b1cfee8bad4583271af4b565";

export default node;
