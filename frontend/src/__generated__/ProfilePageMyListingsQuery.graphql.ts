/**
 * @generated SignedSource<<16bc202bf2a2f92d56aab05b39ab00c4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProfilePageMyListingsQuery$variables = Record<PropertyKey, never>;
export type ProfilePageMyListingsQuery$data = {
  readonly listings: ReadonlyArray<{
    readonly id: string;
    readonly seller: {
      readonly id: string;
    };
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
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "seller",
  "plural": false,
  "selections": [
    (v0/*: any*/)
  ],
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
        "name": "listings",
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
        "name": "listings",
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
    "cacheID": "93066507d638369e89800ea2112135a5",
    "id": null,
    "metadata": {},
    "name": "ProfilePageMyListingsQuery",
    "operationKind": "query",
    "text": "query ProfilePageMyListingsQuery {\n  listings {\n    id\n    seller {\n      id\n    }\n    ...ListingCard_listing\n  }\n}\n\nfragment ListingCard_listing on Listing {\n  id\n  title\n  price\n  images\n  city\n  state\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "576f2cdc0f5c94c3d91bc63c3db9fb17";

export default node;
