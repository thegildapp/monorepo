/**
 * @generated SignedSource<<61333ab7a90a6ff1068ce25f0fd327ab>>
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
  readonly myListings: ReadonlyArray<{
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"ListingCard_listing" | "SellerListingCard_listing">;
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
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ListingCard_listing"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SellerListingCard_listing"
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
            "concreteType": "ImageVariants",
            "kind": "LinkedField",
            "name": "imageVariants",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "thumbnail",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "card",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "full",
                "storageKey": null
              }
            ],
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3f079e1b8c20db9b1a04a3557f4f30bb",
    "id": null,
    "metadata": {},
    "name": "ProfilePageMyListingsQuery",
    "operationKind": "query",
    "text": "query ProfilePageMyListingsQuery {\n  myListings {\n    id\n    ...ListingCard_listing\n    ...SellerListingCard_listing\n  }\n}\n\nfragment ListingCard_listing on Listing {\n  id\n  title\n  price\n  images\n  imageVariants {\n    thumbnail\n    card\n    full\n  }\n  city\n  state\n  createdAt\n}\n\nfragment SellerListingCard_listing on Listing {\n  id\n  title\n  price\n  images\n  imageVariants {\n    thumbnail\n    card\n    full\n  }\n  city\n  state\n  createdAt\n  status\n}\n"
  }
};
})();

(node as any).hash = "d7b3e81bf84c08b44e13fe176057360b";

export default node;
