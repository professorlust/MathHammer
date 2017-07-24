$(document).ready(function() {
	$( "#buttonGo" ).click(function() {
  doTheMath();
});

	function doTheMath(){
		
		// Declare variables

		var ballisticSkill = 0;
		var	numberOfShots = 0;
		var	weaponStrength = 0;
		var	targetToughness = 0;
		var	weaponDamage = 1;
		var weaponDamageD3 = false;
		var weaponDamageD6 = false;
		var targetWounds = 1;
		var	armourSave = 0;
		var	invulSave = 0;
		var	armourPiercing = 3;
		var	actualSave = 0;
		var hits = 0;
		var wounds = 0;
		var unsavedWounds = 0;
		var flamer = false;
		var smallBlast = false;
		var largeBlast = false;
		var rerollHit = false;
		var rerollWound = false;
		var hitMod = 0;
		var woundMod = 0;
		var woundRoll = 0;
		var woundRatio = 0;
		var kills = 0;
		var noSave = false;
		var assault = false;
		var numberOfAttacks = 0;
		var weaponSkill = 0;
		var leadership = 0;
		var moraleCasualties = 0;
		//potentially for validation. positive integer inc 0
		//var positiveRegExp = /^\+?(0|[1-9]\d*)$/;

		// Get Inputs. Using *1 for type coercion. Because input type number gives a string. Stupid.
		ballisticSkill = $('#ballisticSkill').val()*1;
		numberOfShots = $('#numberOfShots').val()*1;
		weaponStrength = $('#weaponStrength').val()*1; 
		targetToughness = $('#toughness').val()*1;
		weaponDamage = $('#weaponDamage').val()*1;
		targetWounds = $('#numberOfWounds').val()*1;
		armourSave = $('#armourSave').val()*1;
		invulSave = $('#invulSave').val()*1;
		armourPiercing = $('#weaponAP').val()*1;
		leadership = $('#leadership').val()*1;
		if ($('#flamerYN').is(":checked"))
			{
  				flamer = true;
			}else{
				flamer = false;
		};
		if ($('#d3ShotsYN').is(":checked"))
			{
  				smallBlast = true;
			}else{
				smallBlast = false;
		};
		if ($('#d6ShotsYN').is(":checked"))
			{
  				largeBlast = true;
			}else{
				largeBlast = false;
		};
		if ($('#d3DamageYN').is(":checked"))
			{
  				weaponDamageD3 = true;
			}else{
				weaponDamageD3 = false;
		};
		if ($('#d6DamageYN').is(":checked"))
			{
  				weaponDamageD6 = true;
			}else{
				weaponDamageD6 = false;
		};
		hitMod = $('#toHitMod').val()*1; 
		woundMod = $('#toWoundMod').val()*1;
		if ($('#rerollWound').is(":checked"))
			{
  				rerollWound = true;
			}else{
				rerollWound = false;
		};
		if ($('#rerollHit').is(":checked"))
			{
  				rerollHit = true;
			}else{
				rerollHit = false;
		};

		// Perform initial calculations

		if (assault === true){
			ballisticSkill = weaponSkill;
			numberOfShots = numberOfAttacks;
		}

		// Calculate actual to save roll including ap
		// Decide whether to use armour save or invul save, whichever is better

		armourPiercing = Math.abs(armourPiercing)
		actualSave = armourSave + armourPiercing;
		if (actualSave + armourPiercing >=7){
			noSave = true;
		} else if (actualSave > invulSave && invulSave != 0){
			actualSave = invulSave;
		}

		// Wound ratio determines the To Wound roll

		woundRatio = targetToughness / weaponStrength;

		// Sets average number of shots for d3 or d6 shot weapons. 

		if (smallBlast === true){
			numberOfShots = 2;
		}
		if (largeBlast === true || flamer === true){
			numberOfShots = 4;
		} 

		// Sets auto hits for flamer

		if (flamer === true){
			hitMod = 0;
			ballisticSkill = 1;
		}

		// Sets weapon damage for d3/d6 damage stat

		if (weaponDamageD3 === true){
			weaponDamage = 2;
		} else if (weaponDamageD6 === true){
			weaponDamage = 4;
		}
		

		// Calculate the wound roll according to weapon strength and target toughness. eg. S8 wounds T4 on 2+

		if (woundRatio <= 0.5){
			woundRoll = 2;
		}else if (woundRatio > 0.5 && woundRatio < 1){
			woundRoll = 3;
		}else if (woundRatio == 1){
			woundRoll = 4;
		}else if (woundRatio > 1 && woundRatio < 2){
			woundRoll = 5;
		}else if (woundRatio >= 2){
			woundRoll = 6;
		}else{
			console.log("Wound Roll Calculation Failure")
		}

		// Call functions for various scenarios
		// This could probably be DRY-er...
		// Order of calls and variable changes is important, rerolls happen then modifiers as per
		// 40k 8th Ed rules. 24/07/17
		// No rerolls or modifiers
		if (rerollHit==false && rerollWound==false && hitMod==0 && woundMod==0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("No reroll/mod causes " + kills + " models removed and " + moraleCasualties + " morale");
		// Reroll hit, no modifiers
		
		}else if(rerollHit==true && rerollWound==false && hitMod==0 && woundMod==0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			numberOfShots -= hits;
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll hit " + kills + " models removed");
		
		// Reroll wound, no modifiers
		
		}else if(rerollHit==false && rerollWound==true && hitMod==0 && woundMod==0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			hits -= wounds;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll wound " + kills + " models removed");
		
		// No Rerolls, to hit modifier
		
		}else if(rerollHit==false && rerollWound==false && hitMod!=0 && woundMod==0){
			//minus hit mod because it's a dice roll. so minus 1 to hit penalty goes from 3+ to 4+. +1 to hit
			//goes 3+ to 2+...counter intuitive but correct. 
			ballisticSkill -= hitMod;
			hits = rollToHit(ballisticSkill, numberOfShots);
			console.log(hits +' hits');
			wounds = rollToWound(woundRoll, hits);
			console.log(wounds +' wounds');
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Mod to hit " + kills + " models removed");
		
		// No Reroll, to wound modifier
		
		}else if(rerollHit==false && rerollWound==false && hitMod==0 && woundMod!=0){
			woundRoll -= woundMod;
			hits = rollToHit(ballisticSkill, numberOfShots);
			console.log(hits +' hits');
			wounds = rollToWound(woundRoll, hits);
			console.log(wounds +' wounds');
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Mod to hit " + kills + " models removed");
		
		// Reroll to hit and wound, no modifier
		
		}else if(rerollHit==true && rerollWound==true && hitMod==0 && woundMod==0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			numberOfShots -= hits;
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			hits -= wounds;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll hit and wound " + kills + " models removed");
		
		// Reroll to wound with hit modifier
		
		}else if(rerollHit==false && rerollWound==true && hitMod!=0 && woundMod==0){
			ballisticSkill -= hitMod;
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			hits -= wounds;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll wound and hit mod " + kills + " models removed");
		
		// Reroll to wound with wound modifier
		
		}else if(rerollHit==false && rerollWound==true && hitMod==0 && woundMod!=0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			woundRoll -= woundMod
			hits -= wounds;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll wound and wound mod " + kills + " models removed");
		
		// Reroll wound with to hit and wound modifiers
		
		}else if(rerollHit==false && rerollWound==true && hitMod!=0 && woundMod!=0){
			ballisticSkill -= hitMod;
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			woundRoll -= woundMod;
			hits -= wounds;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll wound and wound mod " + kills + " models removed");
		
		// Reroll hit with hit modifier
		
		}else if(rerollHit==true && rerollWound==false && hitMod!=0 && woundMod==0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			numberOfShots -= hits;
			ballisticSkill -= hitMod;
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll hit and hit mod " + kills + " models removed");
		
		// Reroll hit with wound modifier
		
		}else if(rerollHit==true && rerollWound==false && hitMod==0 && woundMod!=0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			numberOfShots -= hits;
			hits = rollToHit(ballisticSkill, numberOfShots);
			woundRoll -= woundMod;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll hit wound mod " + kills + " models removed");
		
		// Reroll hit with to wound and to hit modifiers
		
		}else if(rerollHit==true && rerollWound==false && hitMod!=0 && woundMod!=0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			numberOfShots -= hits;
			ballisticSkill -= hitMod;
			hits = rollToHit(ballisticSkill, numberOfShots);
			woundRoll -= woundMod;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll hit and both mod " + kills + " models removed");
		
		// Reroll to hit and wound with hit modifier
		
		}else if(rerollHit==true && rerollWound==true && hitMod!=0 && woundMod==0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			numberOfShots -= hits;
			ballisticSkill -= hitMod;
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			hits -= wounds;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll hit and wound with hit mod " + kills + " models removed");
		
		// Reroll to hit and wound with wound modifier
		
		}else if(rerollHit==true && rerollWound==true && hitMod==0 && woundMod!=0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			numberOfShots -= hits;
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			woundRoll -= woundMod;
			hits -= wounds;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll hit and wound with wound mod " + kills + " models removed");

		// Reroll to hit and wound with hit and wound modifiers
		
		}else if(rerollHit==true && rerollWound==true && hitMod!=0 && woundMod!=0){
			hits = rollToHit(ballisticSkill, numberOfShots);
			ballisticSkill -= hitMod;
			numberOfShots -= hits;
			hits = rollToHit(ballisticSkill, numberOfShots);
			wounds = rollToWound(woundRoll, hits);
			woundRoll -= woundMod;
			hits -= wounds;
			wounds = rollToWound(woundRoll, hits);
			unsavedWounds = rollToSave(wounds, actualSave, noSave);
			kills = calculateKills(unsavedWounds, weaponDamage, targetWounds);
			moraleCasualties = calculateMoraleDamage(leadership, kills);
			console.log("Reroll hit and wound with both mod " + kills + " models removed");
		}else{
			console.log("Oh No! Something broke in the ifs");
		}

		// Put outputs into page

		//$('#resultsYo').html(Math.round(unsavedWounds * 100) / 100 + " wounds caused, " + kills + " models removed, Morale Casualties: " + moraleCasualties);
		$('#resultsYo').html(kills + " models removed, Morale Casualties: " + moraleCasualties);

		// Functions for rolls

		function rollToHit(ballisticSkill, numberOfShots){
			return hits += (numberOfShots * (7 - ballisticSkill))/6;
		}

		function rollToWound(woundRoll,hits){
			return wounds += (hits * (7 - woundRoll))/6;
		}

		function rollToSave(wounds,actualSave,noSave){
			if (noSave === true){
				return unsavedWounds = wounds;
			} else {
				return unsavedWounds = (wounds * (7 - actualSave))/6;
			}
		}

		function calculateKills(unsavedWounds, weaponDamage,targetWounds){
			if (targetWounds >= weaponDamage){
				return kills = Math.floor(((unsavedWounds * weaponDamage) / targetWounds));
			} else {
				return kills = Math.floor(unsavedWounds);
			}
		}

		function calculateMoraleDamage(leadership, kills){
			// The 4 is the average dice roll on a d6
			moraleCasualties = leadership - kills - 4;
			if (moraleCasualties < 0){
				return moraleCasualties *= -1;
			}else{
				return moraleCasualties = 0;
			}
		}
	};
});