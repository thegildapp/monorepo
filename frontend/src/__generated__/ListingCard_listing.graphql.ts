/**
 * @generated SignedSource<<541f51b3b8ea64f64e6ae3a3aeab80ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type CategoryType = "BIKES" | "BOATS" | "CARS" | "PLANES" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ListingCard_listing$data = {
  readonly category: CategoryType;
  readonly city: string | null | undefined;
  readonly createdAt: string;
  readonly id: string;
  readonly images: ReadonlyArray<string>;
  readonly price: number;
  readonly state: string | null | undefined;
  readonly title: string;
  readonly " $fragmentType": "ListingCard_listing";
};
export type ListingCard_listing$key = {
  readonly " $data"?: ListingCard_listing$data;
  readonly " $fragmentSpreads": FragmentRefs<"ListingCard_listing">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ListingCard_listing",
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
      "name": "category",
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
  "type": "Listing",
  "abstractKey": null
};

(node as any).hash = "803cff7871a33e384e74919f2034636e";

export default node;
