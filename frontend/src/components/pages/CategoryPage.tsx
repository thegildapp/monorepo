import { useParams } from 'react-router-dom';
import { useLazyLoadQuery } from 'react-relay';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import NotFound from '../feedback/NotFound';
import ListingGrid from '../features/ListingGrid';
import type { Category } from '../features/CategoryGrid';
import { CategoryType } from '../../types';
import { GetListingsQuery } from '../../queries/listings';
import type { listingsQuery as GetListingsQueryType } from '../../__generated__/listingsQuery.graphql';

const mainCategories: Category[] = [
  { id: 1, name: 'Boats', icon: '/boats.svg' },
  { id: 2, name: 'Planes', icon: '/planes.svg' },
  { id: 3, name: 'Bikes', icon: '/bikes.svg' },
  { id: 4, name: 'Cars', icon: '/cars.svg' }
];

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  
  // Map URL category to GraphQL enum first
  const categoryMap: Record<string, CategoryType> = {
    'boats': CategoryType.Boats,
    'planes': CategoryType.Planes,
    'bikes': CategoryType.Bikes,
    'cars': CategoryType.Cars
  };
  
  const categoryEnum = categoryMap[category || ''];
  
  const data = useLazyLoadQuery<GetListingsQueryType>(GetListingsQuery, {
    category: categoryEnum
  });

  const categoryData = mainCategories.find(cat => cat.name.toLowerCase() === category);
  
  // If category doesn't exist, show 404
  if (!categoryData || !categoryEnum) {
    return <NotFound />;
  }
  
  const categoryTitle = categoryData.name;


  return (
    <Layout>
      <Header 
        logoText="Gild" 
        categoryName={categoryTitle}
      />
      <Main>
        <ListingGrid 
          listings={data.listings}
          category={categoryEnum}
        />
      </Main>
    </Layout>
  );
}