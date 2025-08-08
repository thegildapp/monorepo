/**
 * @generated SignedSource<<8b3c088ccff839629d6e262ad06949a8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type InquiryStatus = "ACCEPTED" | "PENDING" | "REJECTED" | "%future added value";
export type inquiriesRequestContactMutation$variables = {
  listingId: string;
};
export type inquiriesRequestContactMutation$data = {
  readonly requestContact: {
    readonly errors: ReadonlyArray<{
      readonly field: string | null | undefined;
      readonly message: string;
    }> | null | undefined;
    readonly inquiry: {
      readonly createdAt: string;
      readonly id: string;
      readonly status: InquiryStatus;
    } | null | undefined;
  };
};
export type inquiriesRequestContactMutation = {
  response: inquiriesRequestContactMutation$data;
  variables: inquiriesRequestContactMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "listingId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "listingId",
        "variableName": "listingId"
      }
    ],
    "concreteType": "RequestContactPayload",
    "kind": "LinkedField",
    "name": "requestContact",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Inquiry",
        "kind": "LinkedField",
        "name": "inquiry",
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
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
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
    "name": "inquiriesRequestContactMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "inquiriesRequestContactMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9e7fd14d457398fe74d53f2e93ff14a6",
    "id": null,
    "metadata": {},
    "name": "inquiriesRequestContactMutation",
    "operationKind": "mutation",
    "text": "mutation inquiriesRequestContactMutation(\n  $listingId: ID!\n) {\n  requestContact(listingId: $listingId) {\n    inquiry {\n      id\n      status\n      createdAt\n    }\n    errors {\n      field\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7fe75daf56d21b0474f68de7c9b5e06e";

export default node;
