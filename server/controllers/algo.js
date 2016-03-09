exports.getPrice = function(user) {

    var vanFitNames = [];
    var extras = {};
    var genOptions = {
        cushionPercent: 18,
        ppl: 117,
        litresInGallon: 4.54609188,
        loadTime: 0.46,
        unloadTime: 0.32,
        maxWeight: 40,
        dismantlePerItem: 40,
        reassemblyPerItem: 80,
        porterPerHour: 7.00,
        porterHourlyCost: 25.00,
        driverPerHour: 8.00,
        driverHourlyCost: 30,
    }

    var vans = [
        {
            'name': 'Luton',
            'Seat Number': 3,
            'Max Capacity': 660,
            'Load Height': 2.3,
            'Load Width': 2.1,
            'Load Length': 3.95,
            'External Height': 3.1,
            'External Width': 2.16,
            'External Length': 6.95,
            'Mileage Cost': 20,
            'Van Count': 0,
        },
        {
            'name': 'LWB',
            'Seat Number': 3,
            'Max Capacity': 300,
            'Load Height': 1.94,
            'Load Width': 1.35,
            'Load Length': 4.3,
            'External Height': 2.71,
            'External Width': 1.99,
            'External Length': 6.94,
            'Mileage Cost': 20,
            'Van Count': 0,
        },
    ];

    var items = user.itemData;


    // Add Percent Cushion Space To Cubic Vol
        user['cv'] = ( (user.cubicVol / 100) * genOptions.cushionPercent ) + user.cubicVol;

    // Choose Vans
        decideVans();

    // Work Out Fuel
        user.fuelPrice = fuelCost();

    // Add up staff
        handleStaff();

    // Check If Item Fits
        checkItemWeight();

    // Get Load Time & Unload Time
        calcTime();

    // Protection Time
        protectionTime();

    // Dismantle Time
        dismantleTime();

    // Calc Staff Wages
        calcStaffWages();

    // Margin
        //calcMargin();

    // Calc Final Price
        calcFinalPrice();

    // Calc Display Times
        calcTimes();

    // Console Info
        //consoleInfo();


        function decideVans() {
            var cv = user['cv'];
            if(cv <= 300) {addVanData(0,1);}
            if(cv > 300 && cv < 660) {addVanData(1,0);}
            if(cv >= 660 && cv <= 959) {addVanData(1,1);}
            if(cv >= 960 && cv <= 1319) {addVanData(2,0);}
            if(cv >= 1320 && cv <= 1619) {addVanData(2,1);}
            if(cv >= 1620 && cv <= 1979) {addVanData(3,0);}
            if(cv >= 1980 && cv <= 2279) {addVanData(3,1);}
            if(cv >= 2280 && cv <= 2639) {addVanData(4,0);}
            if(cv >= 2640) {addVanData(4,1);}
        }

        function addVanData(lutonCount, lwbCount) {
            vans[0]['Van Count'] = lutonCount;
            vans[1]['Van Count'] = lwbCount;
            user.lutonNeeded = lutonCount;
            user.lwbNeeded = lwbCount;
            user.vansNeeded = lutonCount + lwbCount;
        }

        function fuelCost() {
            var distMiles = conDist(user.distance, 'meters', 'miles');
            return (distMiles * 0.4) * user.vansNeeded;
        }

        function conLiquid(val) {
            // Litre To Gallon
            return 0.26417205 * val;
        }

        // From & to = (meters, km, miles)
        function conDist(val, from, to) {
            if(from == 'meters' && to == 'miles') {
                var temp =  0.00062137 * val;
                return temp.toFixed(2);
            }
        }
    // End Vans


    // Add Staff
        function handleStaff() {
            var cv = user['cv'];
            var pdfrom = user.parkDistFrom;
            var pdto = user.parkDistTo;
            var lf = user.liftFrom;
            var lt = user.liftTo;
            var ff = user.floorsFrom;
            var ft = user.floorsTo;

            // Find Staff Req
            if(cv <= 150) {
                user.staffReq = 1;
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            }

            if(cv > 150 && cv <= 300) {
                user.staffReq = 1;
                // IF NO LIFT
                if(lt == 0 || lf == 0) {
                    if(ff >= 2 || ft >= 2) {
                        user.staffReq += 1;
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            } // END CASE

            if(cv > 300 && cv <= 800) {
                user.staffReq = 2;
                // IF NO LIFT
                if(lt == 0 || lf == 0) {
                    if(cv >= 300 && cv <= 400) {
                        // Do Nothing!
                    } else {
                        if(ff >= 5 || ft >= 5) {
                            alert('Need Lift For 5 Floor And Above: cv 300 - 800');
                        } else {
                            if(ff == 4 || ft == 4) {
                                user.staffReq += 1;
                                user.staffReq += 1;
                            } else {
                                if(ff >= 2 || ft >= 2) {
                                    user.staffReq += 1;
                                }
                            }
                        }
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            } // END CASE

            if(cv > 800 && cv <= 1450) {
                user.staffReq = 3;
                if(lt == 0 || lf == 0) {
                    if(ff == 2 || ft == 2) {
                        user.staffReq += 1;
                    }
                    if(ff == 3 || ft == 3) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 4 || ft == 4) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 5 || ft == 5) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff >= 6 || ft >= 6) {
                        alert('6th Floor+, No Lift, Can not Do');
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            }


            if(cv > 1450 && cv <= 2050) {
                user.staffReq = 4;
                if(lt == 0 || lf == 0) {
                    if(ff == 2 || ft == 2) {
                        user.staffReq += 1;
                    }
                    if(ff == 3 || ft == 3) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 4 || ft == 4) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 5 || ft == 5) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff >= 6 || ft >= 6) {
                        alert('6th Floor+, No Lift, Can not Do');
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            }

            if(cv > 2050 && cv <= 2600) {
                user.staffReq = 5;
                if(lt == 0 || lf == 0) {
                    if(ff == 2 || ft == 2) {
                        user.staffReq += 1;
                    }
                    if(ff == 3 || ft == 3) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 4 || ft == 4) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 5 || ft == 5) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff >= 6 || ft >= 6) {
                        alert('6th Floor+, No Lift, Can not Do');
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            }
            // Update Staff
            staffRequired();
        }


        function staffRequired() {
            user['driversReq'] = user['vansNeeded'];
            user['portersReq'] = user.staffReq - user.driversReq;
        }


        function parkConsider(cv) {
            var cv = user['cv'];
            var pdfrom = user.parkDistFrom;
            var pdto = user.parkDistTo;

            if(cv >= 300 && cv <= 400) {
                // Do Nothing ?DUNNO
            } else if(cv >= 150) {
                var temp1 = pdfrom;
                var temp2 = pdto;
                if(temp1 > temp2) {
                    temp1 = temp1 - 40;
                    temp1 = temp1 / 40;
                    if(temp1 >= 1) {
                        user.staffReq += Math.floor(temp1);
                    }
                } else {
                    if(temp2 > temp1) {
                        temp2 = temp2 - 40;
                        temp2 = temp2 / 40;
                        if(temp2 >= 1) {
                            user.staffReq += Math.floor(temp2);
                        }
                    }
                }
            } else if(cv < 150){
                var temp1 = pdfrom;
                var temp2 = pdto;
                if(temp1 > temp2) {
                    temp1 = temp1 - 40;
                    temp1 = temp1 / 20;
                    if(temp1 >= 1) {
                        user.staffReq += Math.floor(temp1);
                    }
                } else {
                    if(temp2 > temp1) {
                        temp2 = temp2 - 40;
                        temp2 = temp2 / 20;
                        if(temp2 >= 1) {
                            user.staffReq += Math.floor(temp2);
                        }
                    }
                }
            }
            staffRequired();
        }


        function checkItemWeight() {
            var flag = 0;
            var weightExtraStaff = 0;

            var currItemWeight = 0;
            var currItemHeight = 0;
            var currItemVol = 0;

            var heaviestItem = 0;
            var highestItem = 0;
            var biggestVol = 0;


            // Loop Through Items For Attributes
            Object.keys(items).forEach(function(i) {
                if(items[i]['tempCubicValue'] > 0) {
                    currItemWeight 	= items[i]['tempCubicWeight'];
                    currItemHeight 	= items[i]['tempCubicHeight'];
                    currItemVol 	= items[i]['tempCubicVol'];
                    currItemid 		= items[i]['tempCubicId'];

                    // Find Heaviest Item
                    if(currItemWeight > heaviestItem) {
                        heaviestItem = currItemWeight;
                        user.heaviestItem = currItemWeight;
                        user.notes += currItemid+', ';
                    }

                    // Find Highest Item
                    if(currItemHeight > highestItem) {
                        highestItem = currItemHeight;
                        user.highestItem = currItemHeight;
                    }

                    // Find Biggest Vol
                    if(currItemVol > biggestVol) {
                        biggestVol = currItemVol;
                        user.biggestVol = currItemVol;
                    }
                }
            })

            // Do We Need More Staff?
            if(user.staffReq == 1) {
                if(biggestVol >= 25 && biggestVol <= 50 && heaviestItem <= genOptions['maxWeight']) {
                    // Dont Add Staff
                    user.notes += 'biggestVol >= 25 && biggestVol <= 50 && heaviestItem <= maxWeight | ';
                }
                if(biggestVol >= 25 && biggestVol <= 50 && heaviestItem > genOptions['maxWeight']) {
                    flag += 1;
                    user.notes += 'biggestVol >= 25 && biggestVol <= 50 && heaviestItem > maxWeight | ';
                }
                if(biggestVol > 50 && heaviestItem < genOptions['maxWeight']) {
                    flag += 1;
                    user.notes += 'biggestVol > 50 && heaviestItem < genOptions maxWeight | ';
                }
                if(biggestVol >= 50 && heaviestItem > genOptions['maxWeight']) {
                    flag += 1;
                    user.notes += 'biggestVol >= 50 && heaviestItem > genOptions <= maxWeight | ';
                }
            }

            // If Yes Then Add Staff
            if(flag > 0) {user.staffReq += 1;}

            // Distribute Weight Amongst Workers
            if(user.staffReq > 1) {
                // Max Staff Carry Load
                var maxStaffCarryLoad = genOptions['maxWeight'] * user.staffReq;

                // Add staff to carry heavy items
                while(maxStaffCarryLoad < heaviestItem) {
                    user.staffReq += 1;
                    maxStaffCarryLoad += genOptions['maxWeight'];
                }
            }
            staffRequired();
        }

        function dec2Time(workHours) {
            var mins = workHours * 60;
            var hr = Math.floor(mins / 60);
            var hrTemp = Math.floor(hr);
            if(hrTemp == 0) {
                //hrTemp = '';
            } else {
                //hrTemp = hrTemp+'h ';
            }
            var remMin = Math.floor(mins % 60);
            var disTemp = hrTemp+':'+remMin;
            return disTemp;
        }


        function calcTime() {
            // Load Time
            var loadTime = (genOptions['loadTime'] * user['cv']) / user.staffReq;
            if(user.staffReq == 3 || user.staffReq == 5 || user.staffReq == 7) {
                var loadTime = (genOptions['loadTime'] * user['cv']) / (user.staffReq - .4);
            }
            //loadTime = (loadTime / 60);
            user.loadTimeNet = loadTime;

            // Unload Time
            var unloadTime = (genOptions['unloadTime'] * user['cv'] ) / user.staffReq;
            if(user.staffReq == 3 || user.staffReq == 5 || user.staffReq == 7) {
                var unloadTime = (genOptions['unloadTime'] * user['cv'] ) / (user.staffReq - .4);
            }
            //unloadTime = unloadTime / 60;
            user.unloadTimeNet = unloadTime;
        }

        function protectionTime() {
            var wrapAmountTotal = 0;
            if(user['protArray']) {
                Object.keys(user['protArray']).forEach(function(i, v) {
                    var cubicVol = items[i]['tempCubicVol'];
                    var wrapAmount = Math.round(cubicVol / 5);
                    wrapAmountTotal += wrapAmount * user['protArray'][i];
                    //user.notes += ' - '+wrapAmountTotal;
                })
                user.extraProtTime = wrapAmountTotal / user.staffReq;
            }
        }

        function dismantleTime() {
            if(user['dismantleArray']) {
                Object.keys(user['dismantleArray']).forEach(function(i, v) {
                    var keyTemp = Object.keys(user.dismantleOptionsArray)[v];
                    if(user.dismantleOptionsArray[i] == 'Dismantle') {
                        user.extraDismantleTime += genOptions['dismantlePerItem'] * user['dismantleArray'][keyTemp];
                    }
                    if(user.dismantleOptionsArray[i] == 'Reassemble') {
                        user.extraDismantleTime += genOptions['reassemblyPerItem'] * user['dismantleArray'][keyTemp];
                    }
                    if(user.dismantleOptionsArray[i] == 'Both') {
                        user.extraDismantleTime += (genOptions['reassemblyPerItem'] * user['dismantleArray'][keyTemp]) + (genOptions['dismantlePerItem'] * user['dismantleArray'][keyTemp]);
                    }
                })
                user.extraDismantleTime = user.extraDismantleTime / (user['driversReq'] + user['portersReq']);
            }
        }


        function calcStaffWages() {
            if(user['distMiles'] > 100) {
                user['workTime2'] = (user.loadTimeNet + user.unloadTimeNet + user.extraProtTime + user.extraDismantleTime + parseFloat(user.b2cTime / 60) + parseFloat(user.c2aTime / 60)) / 60;
                user['porterWages'] = ((genOptions['porterPerHour'] * user['workTime2']) * user['portersReq']);
                user['driverWages'] = ((genOptions['driverPerHour'] * user['workTime2']) * user['driversReq']);
                // Dec To Time
                user['workTimeDisplay'] = dec2Time(user['workTime2']);
            } else {
                user['workTime'] = (user.loadTimeNet + user.unloadTimeNet + user.extraProtTime + user.extraDismantleTime + parseFloat(user.b2cTime / 60)) / 60;
                user['porterWages'] = ((genOptions['porterPerHour'] * user['workTime']) * user['portersReq']);
                user['driverWages'] = ((genOptions['driverPerHour'] * user['workTime']) * user['driversReq']);
                // Dec To Time
                user['workTimeDisplay'] = dec2Time(user['workTime']);
            }
            user['notes'] += user.b2cTime + ' - ' + user.c2aTime;

            // CALC HOURLY COST
            user['driverHourlyCost'] = (genOptions['driverHourlyCost'] * user['workTime']) * user['driversReq'];
            user['porterHourlyCost'] = (genOptions['porterHourlyCost'] * user['workTime']) * user['portersReq'];
        }





        function calcFinalPrice() {
            // Price Without Additional Service
            user['jobCost'] = user['porterWages'] + user['driverWages'] + user['fuelPrice'];
            user['customerCost'] = user['porterHourlyCost'] + user['driverHourlyCost'] + user['fuelPrice'];

            user['movePrice'] = user['customerCost'];
            user['finalPrice'] = user['customerCost'];
            user['finalPrice'] = Math.ceil(user['finalPrice']);

            user['margin'] = user['customerCost'] - user['jobCost'];


            if(user['lutonNeeded'] == 1) {
                if(user['margin'] < 230) {
                    var tempMargDiff = 230 - user['margin'];
                }
            }
            if(user['lutonNeeded'] == 2) {
                if(user['margin'] < 350) {
                    var tempMargDiff = 350 - user['margin'];
                }
            }
            if(user['lutonNeeded'] == 3) {
                if(user['margin'] < 550) {
                    var tempMargDiff = 550 - user['margin'];
                }
            }
            if(user['vansNeeded'] == 1) {
                if(user['lwbNeeded'] == 1) {
                    if(user['margin'] < 190) {
                        var tempMargDiff = 190 - user['margin'];
                    }
                }
            }

            user['finalPrice'] = user['finalPrice'] + tempMargDiff;
            user['finalPrice'] = Math.ceil(user['finalPrice']);

        }


        function calcTimes() {
            // Work Out End Time
            var date1 = user.dateTime;
            var date2 = new Date(date1);
            var workTimeTemp = user.workTime * 60;
            var newDateObj = new Date();
            newDateObj.setTime(date2.getTime() + (workTimeTemp * 60 * 1000));
            user.endTime = newDateObj.getHours()+':'+newDateObj.getMinutes();
        }



        function consoleInfo() {
            console.log(genOptions);
        }

};

















/*exports.getPrice = function(user) {

    var vanFitNames = [];
    var extras = {};
    var genOptions = {
        cushionPercent: 18,
        ppl: 117,
        litresInGallon: 4.54609188,
        loadTime: 0.36,
        unloadTime: 0.24,
        maxWeight: 40,
        dismantlePerItem: 40,
        reassemblyPerItem: 80,
        porterPerHour: 7.00,
        driverPerHour: 8.00,
    }

    var vans = [
        {
            'name': 'Luton',
            'Seat Number': 3,
            'Max Capacity': 660,
            'Load Height': 2.3,
            'Load Width': 2.1,
            'Load Length': 3.95,
            'External Height': 3.1,
            'External Width': 2.16,
            'External Length': 6.95,
            'Mileage Cost': 20,
            'Van Count': 0,
        },
        {
            'name': 'LWB',
            'Seat Number': 3,
            'Max Capacity': 300,
            'Load Height': 1.94,
            'Load Width': 1.35,
            'Load Length': 4.3,
            'External Height': 2.71,
            'External Width': 1.99,
            'External Length': 6.94,
            'Mileage Cost': 20,
            'Van Count': 0,
        },
    ];

    var items = user.itemData;


    // Add Percent Cushion Space To Cubic Vol
        user['cv'] = ( (user.cubicVol / 100) * genOptions.cushionPercent ) + user.cubicVol;

    // Choose Vans
        decideVans();

    // Work Out Fuel
        var fuelPrice = 0;
        vans.forEach(function(v,i) {
            var tempVanCount = v['Van Count'];
            user.fuelPrice += (fuelCost(i) * tempVanCount);
        })

    // Add up staff
        handleStaff();

    // Check If Item Fits
        checkItemWeight();

    // Get Load Time & Unload Time
        calcTime();

    // Protection Time
        protectionTime();

    // Dismantle Time
        dismantleTime();

    // Calc Staff Wages
        calcStaffWages();

    // Margin
        calcMargin();

    // Calc Final Price
        calcFinalPrice();

    // Calc Display Times
        calcTimes();

    // Console Info
        //consoleInfo();


        function decideVans() {
            var cv = user['cv'];
            if(cv <= 300) {addVanData(0,1);}
            if(cv > 300 && cv < 660) {addVanData(1,0);}
            if(cv >= 660 && cv <= 959) {addVanData(1,1);}
            if(cv >= 960 && cv <= 1319) {addVanData(2,0);}
            if(cv >= 1320 && cv <= 1619) {addVanData(2,1);}
            if(cv >= 1620 && cv <= 1979) {addVanData(3,0);}
            if(cv >= 1980 && cv <= 2279) {addVanData(3,1);}
            if(cv >= 2280 && cv <= 2639) {addVanData(4,0);}
            if(cv >= 2640) {addVanData(4,1);}
        }

        function addVanData(lutonCount, lwbCount) {
            vans[0]['Van Count'] = lutonCount;
            vans[1]['Van Count'] = lwbCount;
            user.vansNeeded = lutonCount + lwbCount;
        }

        function fuelCost(i) {
            var distMiles = conDist(user.distance, 'meters', 'miles');
            var GallonsUsed = (distMiles/ vans[i]['Mileage Cost']);
            return (((GallonsUsed * genOptions['litresInGallon']) * genOptions['ppl']) / 100);
        }

        function conLiquid(val) {
            // Litre To Gallon
            return 0.26417205 * val;
        }

        // From & to = (meters, km, miles)
        function conDist(val, from, to) {
            if(from == 'meters' && to == 'miles') {
                var temp =  0.00062137 * val;
                return temp.toFixed(2);
            }
        }
    // End Vans


    // Add Staff
        function handleStaff() {
            var cv = user['cv'];
            var pdfrom = user.parkDistFrom;
            var pdto = user.parkDistTo;
            var lf = user.liftFrom;
            var lt = user.liftTo;
            var ff = user.floorsFrom;
            var ft = user.floorsTo;

            // Find Staff Req
            if(cv <= 150) {
                user.staffReq = 1;
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            }

            if(cv > 150 && cv <= 300) {
                user.staffReq = 1;
                // IF NO LIFT
                if(lt == 0 || lf == 0) {
                    if(ff >= 2 || ft >= 2) {
                        user.staffReq += 1;
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            } // END CASE

            if(cv > 300 && cv <= 800) {
                user.staffReq = 2;
                // IF NO LIFT
                if(lt == 0 || lf == 0) {
                    if(cv >= 300 && cv <= 400) {
                        // Do Nothing!
                    } else {
                        if(ff >= 5 || ft >= 5) {
                            alert('Need Lift For 5 Floor And Above: cv 300 - 800');
                        } else {
                            if(ff == 4 || ft == 4) {
                                user.staffReq += 1;
                                user.staffReq += 1;
                            } else {
                                if(ff >= 2 || ft >= 2) {
                                    user.staffReq += 1;
                                }
                            }
                        }
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            } // END CASE

            if(cv > 800 && cv <= 1450) {
                user.staffReq = 3;
                if(lt == 0 || lf == 0) {
                    if(ff == 2 || ft == 2) {
                        user.staffReq += 1;
                    }
                    if(ff == 3 || ft == 3) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 4 || ft == 4) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 5 || ft == 5) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff >= 6 || ft >= 6) {
                        alert('6th Floor+, No Lift, Can not Do');
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            }


            if(cv > 1450 && cv <= 2050) {
                user.staffReq = 4;
                if(lt == 0 || lf == 0) {
                    if(ff == 2 || ft == 2) {
                        user.staffReq += 1;
                    }
                    if(ff == 3 || ft == 3) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 4 || ft == 4) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 5 || ft == 5) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff >= 6 || ft >= 6) {
                        alert('6th Floor+, No Lift, Can not Do');
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            }

            if(cv > 2050 && cv <= 2600) {
                user.staffReq = 5;
                if(lt == 0 || lf == 0) {
                    if(ff == 2 || ft == 2) {
                        user.staffReq += 1;
                    }
                    if(ff == 3 || ft == 3) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 4 || ft == 4) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff == 5 || ft == 5) {
                        user.staffReq += 1;
                        user.staffReq += 1;
                    }
                    if(ff >= 6 || ft >= 6) {
                        alert('6th Floor+, No Lift, Can not Do');
                    }
                }
                if(pdfrom > 40 || pdto > 40) {
                    user.staffReq += 1;
                    parkConsider(cv);
                }
            }
            // Update Staff
            staffRequired();
        }


        function staffRequired() {
            user['driversReq'] = user['vansNeeded'];
            user['portersReq'] = user.staffReq - user.driversReq;
        }


        function parkConsider(cv) {
            var cv = user['cv'];
            var pdfrom = user.parkDistFrom;
            var pdto = user.parkDistTo;

            if(cv >= 300 && cv <= 400) {
                // Do Nothing ?DUNNO
            } else if(cv >= 150) {
                var temp1 = pdfrom;
                var temp2 = pdto;
                if(temp1 > temp2) {
                    temp1 = temp1 - 40;
                    temp1 = temp1 / 40;
                    if(temp1 >= 1) {
                        user.staffReq += Math.floor(temp1);
                    }
                } else {
                    if(temp2 > temp1) {
                        temp2 = temp2 - 40;
                        temp2 = temp2 / 40;
                        if(temp2 >= 1) {
                            user.staffReq += Math.floor(temp2);
                        }
                    }
                }
            } else if(cv < 150){
                var temp1 = pdfrom;
                var temp2 = pdto;
                if(temp1 > temp2) {
                    temp1 = temp1 - 40;
                    temp1 = temp1 / 20;
                    if(temp1 >= 1) {
                        user.staffReq += Math.floor(temp1);
                    }
                } else {
                    if(temp2 > temp1) {
                        temp2 = temp2 - 40;
                        temp2 = temp2 / 20;
                        if(temp2 >= 1) {
                            user.staffReq += Math.floor(temp2);
                        }
                    }
                }
            }
            staffRequired();
        }


        function checkItemWeight() {
            var flag = 0;
            var weightExtraStaff = 0;

            var currItemWeight = 0;
            var currItemHeight = 0;
            var currItemVol = 0;

            var heaviestItem = 0;
            var highestItem = 0;
            var biggestVol = 0;



            // Loop Through Items For Attributes
            Object.keys(items).forEach(function(i) {
                if(items[i]['tempCubicValue'] > 0) {
                    currItemWeight 	= items[i]['tempCubicWeight'];
                    currItemHeight 	= items[i]['tempCubicHeight'];
                    currItemVol 	= items[i]['tempCubicVol'];
                    currItemid 		= items[i]['tempCubicId'];

                    // Find Heaviest Item
                    if(currItemWeight > heaviestItem) {
                        heaviestItem = currItemWeight;
                        user.heaviestItem = currItemWeight;
                        user.notes += currItemid+', ';
                    }

                    // Find Highest Item
                    if(currItemHeight > highestItem) {
                        highestItem = currItemHeight;
                        user.highestItem = currItemHeight;
                    }

                    // Find Biggest Vol
                    if(currItemVol > biggestVol) {
                        biggestVol = currItemVol;
                        user.biggestVol = currItemVol;
                    }
                }
            })

            // Do We Need More Staff?
            if(user.staffReq == 1) {
                if(biggestVol >= 25 && biggestVol <= 50 && heaviestItem <= genOptions['maxWeight']) {
                    // Dont Add Staff
                    user.notes += 'biggestVol >= 25 && biggestVol <= 50 && heaviestItem <= maxWeight | ';
                }
                if(biggestVol >= 25 && biggestVol <= 50 && heaviestItem > genOptions['maxWeight']) {
                    flag += 1;
                    user.notes += 'biggestVol >= 25 && biggestVol <= 50 && heaviestItem > maxWeight | ';
                }
                if(biggestVol > 50 && heaviestItem < genOptions['maxWeight']) {
                    flag += 1;
                    user.notes += 'biggestVol > 50 && heaviestItem < genOptions maxWeight | ';
                }
                if(biggestVol >= 50 && heaviestItem > genOptions['maxWeight']) {
                    flag += 1;
                    user.notes += 'biggestVol >= 50 && heaviestItem > genOptions <= maxWeight | ';
                }
            }

            // If Yes Then Add Staff
            if(flag > 0) {user.staffReq += 1;}

            // Distribute Weight Amongst Workers
            if(user.staffReq > 1) {
                // Max Staff Carry Load
                var maxStaffCarryLoad = genOptions['maxWeight'] * user.staffReq;

                // Add staff to carry heavy items
                while(maxStaffCarryLoad < heaviestItem) {
                    user.staffReq += 1;
                    maxStaffCarryLoad += genOptions['maxWeight'];
                }
            }
            staffRequired();
        }

        function dec2Time(workHours) {
            var mins = workHours * 60;
            var hr = Math.floor(mins / 60);
            var hrTemp = Math.floor(hr);
            if(hrTemp == 0) {
                //hrTemp = '';
            } else {
                //hrTemp = hrTemp+'h ';
            }
            var remMin = Math.floor(mins % 60);
            var disTemp = hrTemp+':'+remMin;
            return disTemp;
        }


        function calcTime() {
            // Load Time
            var loadTime = (genOptions['loadTime'] * user['cubicVol']) / user.staffReq;
            //loadTime = (loadTime / 60);
            user.loadTimeNet = loadTime;

            // Unload Time
            var unloadTime = (genOptions['unloadTime'] * user['cubicVol'] ) / user.staffReq;
            //unloadTime = unloadTime / 60;
            user.unloadTimeNet = unloadTime;

        }

        function protectionTime() {
            var wrapAmountTotal = 0;
            if(user['protArray']) {
                Object.keys(user['protArray']).forEach(function(i, v) {
                    var cubicVol = items[i]['tempCubicVol'];
                    var wrapAmount = Math.round(cubicVol / 5);
                    wrapAmountTotal += wrapAmount * user['protArray'][i];
                    //user.notes += ' - '+wrapAmountTotal;
                })
                user.extraProtTime = wrapAmountTotal / user.staffReq;
            }
        }

        function dismantleTime() {
            if(user['dismantleArray']) {
                Object.keys(user['dismantleArray']).forEach(function(i, v) {
                    var keyTemp = Object.keys(user.dismantleOptionsArray)[v];
                    if(user.dismantleOptionsArray[i] == 'Dismantle') {
                        user.extraDismantleTime += genOptions['dismantlePerItem'] * user['dismantleArray'][keyTemp];
                    }
                    if(user.dismantleOptionsArray[i] == 'Reassemble') {
                        user.extraDismantleTime += genOptions['reassemblyPerItem'] * user['dismantleArray'][keyTemp];
                    }
                    if(user.dismantleOptionsArray[i] == 'Both') {
                        user.extraDismantleTime += (genOptions['reassemblyPerItem'] * user['dismantleArray'][keyTemp]) + (genOptions['dismantlePerItem'] * user['dismantleArray'][keyTemp]);
                    }
                })
                user.extraDismantleTime = user.extraDismantleTime / (user['driversReq'] + user['portersReq']);
            }
        }


        function calcStaffWages() {
            if(user['distMiles'] > 100) {
                user['workTime2'] = (user.loadTimeNet + user.unloadTimeNet + user.extraProtTime + user.extraDismantleTime + parseFloat(user.b2cTime / 60) + parseFloat(user.c2aTime / 60)) / 60;
                user['porterWages'] = ((genOptions['porterPerHour'] * user['workTime2']) * user['portersReq']);
                user['driverWages'] = ((genOptions['driverPerHour'] * user['workTime2']) * user['driversReq']);
                // Dec To Time
                user['workTimeDisplay'] = dec2Time(user['workTime2']);
            } else {
                user['workTime'] = (user.loadTimeNet + user.unloadTimeNet + user.extraProtTime + user.extraDismantleTime + parseFloat(user.b2cTime / 60)) / 60;
                user['porterWages'] = ((genOptions['porterPerHour'] * user['workTime']) * user['portersReq']);
                user['driverWages'] = ((genOptions['driverPerHour'] * user['workTime']) * user['driversReq']);
                // Dec To Time
                user['workTimeDisplay'] = dec2Time(user['workTime']);
            }
            user['notes'] += user.b2cTime + ' - ' + user.c2aTime;
        }


        function calcMargin() {
            var cv = user['cv'];
            if(cv <= 100) {user['margin'] = 50;}
            if(cv > 100 && cv <= 200) {user['margin'] = 75;}
            if(cv > 200 && cv <= 300) {user['margin'] = 100;}
            if(cv > 300 && cv < 660) {user['margin'] = 150;}
            if(cv >= 660 && cv <= 959) {user['margin'] = 200;}
            if(cv >= 960 && cv <= 1319) {user['margin'] = 250;}
            if(cv >= 1320 && cv <= 1619) {user['margin'] = 400;}
            if(cv >= 1620 && cv <= 1979) {user['margin'] = 450;}
            if(cv >= 1980 && cv <= 2279) {user['margin'] = 500;}
            if(cv >= 2280 && cv <= 2639) {user['margin'] = 500;}
            if(cv >= 2640) {user['margin'] = 550;}
        }


        function calcFinalPrice() {
            // Price Without Additional Service
            user['movePrice'] = user['porterWages'] + user['driverWages'] + user['margin'] + user['fuelPrice'];
            user['finalPrice'] = user['porterWages'] + user['driverWages'] + user['margin'] + user['fuelPrice'];
            user['finalPrice'] = Math.ceil(user['finalPrice']);
        }


        function calcTimes() {
            // Work Out End Time
            var date1 = user.dateTime;
            var date2 = new Date(date1);
            var workTimeTemp = user.workTime * 60;
            var newDateObj = new Date();
            newDateObj.setTime(date2.getTime() + (workTimeTemp * 60 * 1000));
            user.endTime = newDateObj.getHours()+':'+newDateObj.getMinutes();
        }



        function consoleInfo() {
            console.log(genOptions);
        }

};

*/
