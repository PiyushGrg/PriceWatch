"use client"
import { scrapeAndStoreProduct } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast';


const isValidAmazonProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if(hostname.includes('amazon.com') || hostname.includes ('amazon.') || hostname.endsWith('amazon')) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
}


const Searchbar = () => {

  const router = useRouter();
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidAmazonProductURL(searchPrompt);

    if(!isValidLink){
      toast.error('Please enter a valid Amazon product link');
      return;
    }

    try {
      setIsLoading(true);

      // Scrape the product page
      const product : any = await scrapeAndStoreProduct(searchPrompt);
      router.push(`/products/${product._id}`);
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }

  }

  return (
    <form 
      className="flex flex-wrap gap-4 mt-12" 
      onSubmit={handleSubmit}
    >
      <input 
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter Amazon product link"
        className="searchbar-input"
      />

      <button 
        type="submit" 
        className="searchbar-btn"
        disabled={searchPrompt === ''}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default Searchbar