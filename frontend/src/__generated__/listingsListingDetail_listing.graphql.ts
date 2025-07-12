/**
 * @generated SignedSource<<6ccc3252ea6832ec8c514edf15e47f5e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type CategoryType = "BIKES" | "BOATS" | "CARS" | "PLANES" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type listingsListingDetail_listing$data = {
  readonly category: CategoryType;
  readonly city: string | null | undefined;
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly images: ReadonlyArray<string>;
  readonly price: number;
  readonly seller: {
    readonly avatarUrl: string | null | undefined;
    readonly email: string;
    readonly id: string;
    readonly name: string;
    readonly phone: string | null | undefined;
  };
  readonly specifications: {
    readonly engineSize?: number | null | undefined;
    readonly engineType?: string | null | undefined;
    readonly fuelType?: string | null | undefined;
    readonly horsepower?: number | null | undefined;
    readonly hours?: number | null | undefined;
    readonly hullMaterial?: string | null | undefined;
    readonly length?: number | null | undefined;
    readonly make?: string | null | undefined;
    readonly mileage?: number | null | undefined;
    readonly model?: string | null | undefined;
    readonly seats?: number | null | undefined;
    readonly transmission?: string | null | undefined;
    readonly year?: number | null | undefined;
  };
  readonly state: string | null | undefined;
  readonly title: string;
  readonly updatedAt: string;
  readonly " $fragmentType": "listingsListingDetail_listing";
};
export type listingsListingDetail_listing$key = {
  readonly " $data"?: listingsListingDetail_listing$data;
  readonly " $fragmentSpreads": FragmentRefs<"listingsListingDetail_listing">;
};

const node: ReaderFragment = (function(){
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
  "name": "year",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "make",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "model",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "engineType",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mileage",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "listingsListingDetail_listing",
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
      "name": "description",
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
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "seller",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
          "name": "email",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "phone",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "specifications",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "length",
              "storageKey": null
            },
            (v1/*: any*/),
            (v2/*: any*/),
            (v3/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hullMaterial",
              "storageKey": null
            },
            (v4/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "horsepower",
              "storageKey": null
            }
          ],
          "type": "BoatSpecifications",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v1/*: any*/),
            (v2/*: any*/),
            (v3/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hours",
              "storageKey": null
            },
            (v4/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "seats",
              "storageKey": null
            }
          ],
          "type": "PlaneSpecifications",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v1/*: any*/),
            (v2/*: any*/),
            (v3/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "engineSize",
              "storageKey": null
            },
            (v5/*: any*/)
          ],
          "type": "BikeSpecifications",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v1/*: any*/),
            (v2/*: any*/),
            (v3/*: any*/),
            (v5/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "transmission",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "fuelType",
              "storageKey": null
            }
          ],
          "type": "CarSpecifications",
          "abstractKey": null
        }
      ],
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
      "name": "updatedAt",
      "storageKey": null
    }
  ],
  "type": "Listing",
  "abstractKey": null
};
})();

(node as any).hash = "2e50aae6676b8c68ec8c686f3b1f39d6";

export default node;
