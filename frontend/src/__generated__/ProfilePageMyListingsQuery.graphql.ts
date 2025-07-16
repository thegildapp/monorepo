/**
 * @generated SignedSource<<593a74fcb2437f779fc5fe4b70c5fe1e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ListingStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
export type ProfilePageMyListingsQuery$variables = Record<PropertyKey, never>;
export type ProfilePageMyListingsQuery$data = {
  readonly myListings: ReadonlyArray<{
    readonly id: string;
    readonly status: ListingStatus;
    readonly " $fragmentSpreads": FragmentRefs<"ListingCard_listing">;
  }>;
};
export type ProfilePageMyListingsQuery = {
  response: ProfilePageMyListingsQuery$data;
  variables: ProfilePageMyListingsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProfilePageMyListingsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "myListings",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ListingCard_listing"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ProfilePageMyListingsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "myListings",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "price",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "images",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "city",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "state",
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
      }
    ]
  },
  "params": {
    "cacheID": "c70337d0145f4611862695208b86041b",
    "id": null,
    "metadata": {},
    "name": "ProfilePageMyListingsQuery",
    "operationKind": "query",
    "text": "query ProfilePageMyListingsQuery {\n  myListings {\n    id\n    status\n    ...ListingCard_listing\n  }\n}\n\nfragment ListingCard_listing on Listing {\n  id\n  title\n  price\n  images\n  city\n  state\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "600aef6ad9febe23715ab869ce319cdb";

export default node;
