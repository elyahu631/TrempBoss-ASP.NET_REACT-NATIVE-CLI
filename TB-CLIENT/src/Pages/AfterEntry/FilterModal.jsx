import React, { useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Text, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const FilterModal = ({ IsDriver, visible, onApplyFilter, onClose, Theme, FilterOptions }) => {
  const [filterState, setFilterState] = useState({
    allApproved: false,
    noBidders: false,
    approved: false,
    waitingForApproval: false,
    noOffers: false,
    awaitingConfirmation: false,
  });

  useEffect(() => {
    // Update child state when FilterOptions prop changes
    setFilterState(FilterOptions);
  }, [FilterOptions]);

  const handleApplyFilter = () => {
    onApplyFilter(filterState);
  };

  const handleFilterOptionChange = (key, value) => {
    setFilterState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: Theme.colors.background }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-outline" size={30} color={Theme.colors.text.primary} />
          </TouchableOpacity>

          <Text style={[styles.filterTitle, { color: Theme.colors.text.primary }]}>Filter Options</Text>



          {Object.entries(filterState).map(([key, value]) => (
            <View key={key} style={styles.filterOption}>
              <Text style={{ color: "white" }}>{key}</Text>
              <Switch
                trackColor={{ false: Theme.colors.text.secondary, true: Theme.colors.primary }}
                thumbColor={value ? Theme.colors.background : Theme.colors.backgroundLight}
                onValueChange={(newValue) => handleFilterOptionChange(key, newValue)}
                value={value}
              />
            </View>
          ))}


          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: Theme.colors.primary }]}
            onPress={handleApplyFilter}
          >
            <Text style={{ color: Theme.colors.background, fontWeight: 'bold' }}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  applyButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default FilterModal;
