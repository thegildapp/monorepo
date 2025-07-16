/**
 * @generated SignedSource<<bc27fb27d10d65293321ec3b5ab4123e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateProfileInput = {
  avatarUrl?: string | null | undefined;
  name?: string | null | undefined;
  phone?: string | null | undefined;
};
export type authUpdateProfileMutation$variables = {
  input: UpdateProfileInput;
};
export type authUpdateProfileMutation$data = {
  readonly updateProfile: {
    readonly avatarUrl: string | null | undefined;
    readonly email: string;
    readonly id: string;
    readonly name: string;
  };
};
export type authUpdateProfileMutation = {
  response: authUpdateProfileMutation$data;
  variables: authUpdateProfileMutation$variables;
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
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "updateProfile",
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
        "name": "avatarUrl",
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
    "name": "authUpdateProfileMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authUpdateProfileMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "19d9835f6df73bf8cef33a2d5e13051b",
    "id": null,
    "metadata": {},
    "name": "authUpdateProfileMutation",
    "operationKind": "mutation",
    "text": "mutation authUpdateProfileMutation(\n  $input: UpdateProfileInput!\n) {\n  updateProfile(input: $input) {\n    id\n    email\n    name\n    avatarUrl\n  }\n}\n"
  }
};
})();

(node as any).hash = "afb3e99343700c09b5de5804ec59fbfa";

export default node;
