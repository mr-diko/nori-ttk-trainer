import json
import os

def test_menu_data():
    path = '/Users/admin/Downloads/nori-ttk-trainer/src/data/nori-menu.json'
    assert os.path.exists(path), f"File {path} does not exist"
    
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    assert 'categories' in data
    assert 'dishes' in data
    assert 'preps' in data
    assert 'sets' in data
    
    dishes = data['dishes']
    preps = data['preps']
    sets = data['sets']
    
    assert len(dishes) == 101, f"Expected 101 dishes, got {len(dishes)}"
    assert len(preps) == 24, f"Expected 24 preps, got {len(preps)}"
    assert len(sets) == 23, f"Expected 23 sets, got {len(sets)}"
    
    # Check decor tags
    decor_count = sum(1 for d in dishes for i in d['ingredients'] if i.get('isDecor'))
    assert decor_count >= 70, f"Expected at least 70 decor items, got {decor_count}"
    
    # Check specific user example: "Філадельфія з лососем та хіяші 350 г" -> "Соус кунжутний" should be decor
    hiyashi_dish = next((d for d in dishes if 'хіяші' in d['name'].lower()), None)
    assert hiyashi_dish is not None, "Could not find 'Філадельфія з лососем та хіяші'"
    sesame_sauce = next((i for i in hiyashi_dish['ingredients'] if 'кунжутний' in i['name'].lower()), None)
    assert sesame_sauce is not None, "Could not find sesame sauce in hiyashi roll"
    assert sesame_sauce['isDecor'] is True, "Sesame sauce must be tagged as decor!"
    
    # Check that each dish has non-empty fields
    for d in dishes:
        assert d['id'], "Dish missing id"
        assert d['name'], "Dish missing name"
        assert d['category'], f"Dish {d['name']} missing category"
        assert len(d['ingredients']) > 0, f"Dish {d['name']} has no ingredients"
        for ing in d['ingredients']:
            assert ing['name'], f"Ingredient in {d['name']} has no name"
            assert 'isDecor' in ing, f"Ingredient in {d['name']} missing isDecor flag"
            
    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    test_menu_data()
