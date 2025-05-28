import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Search, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react-native';
import MarketItem from '@/components/markets/MarketItem';
import { mockMarketData } from '@/utils/mockData';
import Animated, { FadeIn } from 'react-native-reanimated';

type SortOption = 'marketCap' | 'priceChange' | 'volume';
type FilterOption = 'all' | 'gainers' | 'losers';

export default function MarketsScreen() {
  const { theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('marketCap');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter and sort market data
  const filteredMarketData = mockMarketData
    .filter(item => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.symbol.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter
      if (filter === 'gainers') {
        return item.priceChangePercentage > 0;
      } else if (filter === 'losers') {
        return item.priceChangePercentage < 0;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'marketCap') {
        return b.marketCap - a.marketCap;
      } else if (sortBy === 'priceChange') {
        return b.priceChangePercentage - a.priceChangePercentage;
      } else if (sortBy === 'volume') {
        return b.volume - a.volume;
      }
      return 0;
    });

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleSort = (option: SortOption) => {
    setSortBy(option);
  };

  const handleFilter = (option: FilterOption) => {
    setFilter(option);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Markets</Text>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.backgroundLight }]}>
          <Search color={theme.colors.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search coins..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => handleFilter('all')}
          >
            <ArrowUpDown 
              color={filter === 'all' ? theme.colors.primary : theme.colors.textSecondary} 
              size={16}
            />
            <Text
              style={[
                styles.filterButtonText,
                { color: filter === 'all' ? theme.colors.primary : theme.colors.textSecondary }
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'gainers' && { backgroundColor: theme.colors.success + '20' }
            ]}
            onPress={() => handleFilter('gainers')}
          >
            <TrendingUp 
              color={filter === 'gainers' ? theme.colors.success : theme.colors.textSecondary} 
              size={16}
            />
            <Text
              style={[
                styles.filterButtonText,
                { color: filter === 'gainers' ? theme.colors.success : theme.colors.textSecondary }
              ]}
            >
              Gainers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'losers' && { backgroundColor: theme.colors.error + '20' }
            ]}
            onPress={() => handleFilter('losers')}
          >
            <TrendingDown 
              color={filter === 'losers' ? theme.colors.error : theme.colors.textSecondary} 
              size={16}
            />
            <Text
              style={[
                styles.filterButtonText,
                { color: filter === 'losers' ? theme.colors.error : theme.colors.textSecondary }
              ]}
            >
              Losers
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={[styles.sortContainer, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSort('marketCap')}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === 'marketCap' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            Market Cap
          </Text>
          {sortBy === 'marketCap' && (
            <View style={[styles.sortIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSort('priceChange')}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === 'priceChange' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            24h Change
          </Text>
          {sortBy === 'priceChange' && (
            <View style={[styles.sortIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSort('volume')}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === 'volume' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            Volume
          </Text>
          {sortBy === 'volume' && (
            <View style={[styles.sortIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Market List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.marketList}
          onScrollEndDrag={handleRefresh}
        >
          {filteredMarketData.length > 0 ? (
            filteredMarketData.map((item, index) => (
              <Animated.View 
                key={item.id}
                entering={FadeIn.delay(index * 50)}
              >
                <MarketItem
                  symbol={item.symbol}
                  name={item.name}
                  price={item.price}
                  priceChangePercentage={item.priceChangePercentage}
                  volume={item.volume}
                  marketCap={item.marketCap}
                  chartData={item.chartData}
                />
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 8,
    padding: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sortButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  sortIndicator: {
    height: 3,
    width: 24,
    borderRadius: 2,
    marginTop: 4,
  },
  marketList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
});