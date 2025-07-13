import { useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import CategoryGrid from '../features/CategoryGrid';
import type { Category } from '../features/CategoryGrid';

const mainCategories: Category[] = [
  { id: 1, name: 'Boats', icon: '/boats.svg' },
  { id: 2, name: 'Planes', icon: '/planes.svg' },
  { id: 3, name: 'Bikes', icon: '/bikes.svg' },
  { id: 4, name: 'Cars', icon: '/cars.svg' }
];

export default function HomePage() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    navigate(`/${category.name.toLowerCase()}`);
  };


  return (
    <Layout>
      <Header 
        logoText="Gild" 
        showSearch={false}
      />
      <Main>
        <CategoryGrid 
          categories={mainCategories}
          onCategoryClick={handleCategoryClick}
        />
      </Main>
    </Layout>
  );
}