/**
 * @generated SignedSource<<883ef88fcdbc80c151963e18104f442c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ListingStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type SellerListingCard_listing$data = {
  readonly city: string | null | undefined;
  readonly createdAt: string;
  readonly id: string;
  readonly imageVariants: ReadonlyArray<{
    readonly card: string;
    readonly full: string;
    readonly thumbnail: string;
  }> | null | undefined;
  readonly images: ReadonlyArray<string>;
  readonly price: number;
  readonly state: string | null | undefined;
  readonly status: ListingStatus;
  readonly title: string;
  readonly " $fragmentType": "SellerListingCard_listing";
};
export type SellerListingCard_listing$key = {
  readonly " $data"?: SellerListingCard_listing$data;
  readonly " $fragmentSpreads": FragmentRefs<"SellerListingCard_listing">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SellerListingCard_listing",
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
  "type": "Listing",
  "abstractKey": null
};

(node as any).hash = "2c19de83cac7f5bd62f108e07939dd79";

export default node;
