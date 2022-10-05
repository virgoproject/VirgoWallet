class VirgoFarm {

    static div = {
        virgoFarmApp: $("#virgoFarm"),
        stakingDiv: $(".item-list"),
        stakingList: $('#farmstaking .list'),
        loading : $('#farmstaking .loading'),
        buySwapPopup : $('#buySwapFarm')
    }

    static buttons = {
        appsBtn: $('#body .store .appElement'),
        goBackFarm: $('#virgoFarm .back'),
        inputStakingValue: $('#virgoFarm #stakingValue'),
        stakeButton: $('#virgoFarm #stackVGOBtn'),
    }

    static alert = {
        appPopup: $('#appPopup')
    }

    static text = {
        appsTitle: $('#appPopup .appPPTitle h3'),
        appsFeatures: $('#appPopup .appPPFeatures'),
        appsDesc: $('#appPopup .appPPTDesc'),
        appText1: $('#appPopup .appPPText1'),
        appText2: $('#appPopup .appPPText2'),
        appText3: $('#appPopup .appPPText3'),
        appText4: $('#appPopup .appPPText4'),
        stakeValue: $('#farmstaking .stakedVGO'),
        stakeCount: $('#virgoFarm .stakingCount'),
        balanceValue: $("#virgoFarm .balanceVGO")
    }

    static launch(){
        /*
                VirgoFarm.alert.appPopup.show()
        */
        VirgoFarm.div.buySwapPopup.hide()
        VirgoFarm.div.virgoFarmApp.show()
        let balance

        $(".paneSwitchFarmBtn").click(function (e) {
            const idCheck = $(this).attr('id')
            if(idCheck === 'createStakeBtn'){
                $("#farmstaking").hide()
                $("#farmSetStaking").show()
                $("#myStakeBtn").removeClass('activePane')
                $("#createStakeBtn").addClass('activePane')
            }else {
                $("#farmstaking").show()
                $("#createStakeBtn").removeClass('activePane')
                $("#myStakeBtn").addClass('activePane')
                $("#farmSetStaking").hide()
            }
        })


        VirgoFarm.buttons.goBackFarm.click(function () {
            VirgoFarm.div.virgoFarmApp.hide()
        })

        VirgoFarm.text.appsTitle.html('Virgo Farm <i class="fa-solid fa-badge-check" style="color: var(--mainColor)"></i>')

        $('#allowRange').on("input",function () {
            const max = $(this).attr("max")
            const min = $(this).attr("min")
            const value = $(this).val()
            $(this).css("background", `linear-gradient(to right, var(--mainColorLight) 0%, var(--mainColorLight) ${(value - min) / (max - min) * 100}%, var(--mainLight10) ${(value - min) / (max - min) * 100}%, var(--mainLight10) 100%)`)
            $(".lockTime").html(value)
            $("#allowRange").html($("#allowRange").val().replace(/(.)(?=(\d{3})+$)/g,'$1,'));
            $("#stackAPR").html((0.25*$("#allowRange").val()*4.34524+5.2).toFixed(1) + "%")
            VirgoFarm.calculateEarning(balance)
        })

        $(VirgoFarm.buttons.inputStakingValue).on('input',function () {
            VirgoFarm.calculateEarning(balance)
        })

        $(".lockTime").html($('#allowRange').val())


        VirgoFarm.text.appsFeatures.html("What's Virgo Farm ?")
        VirgoFarm.text.appsDesc.html("Version 1.0")
        VirgoFarm.text.appText1.html('<b>Stake your VGOs, earn rewards</b>, virgoFarm is the application enabling you to stake your VGOs.')
        VirgoFarm.text.appText2.html('<b>Earn while you sleep</b>, up to <b>36.4% APY</b>')
        VirgoFarm.text.appText3.hide()
        VirgoFarm.text.appText4.hide()
        VirgoFarm.div.loading.show()
        VirgoFarm.getLock()
        getBalance("0xfb526228ff1c019e4604c7e7988c097d96bd5b70").then(res => {
             balance = res.balance
            VirgoFarm.text.balanceValue.html(Utils.formatAmount(balance,res.decimals))

            $('#virgoFarm #stakingmaxBtn').click(function () {
                VirgoFarm.buttons.inputStakingValue.val(Utils.formatAmount(balance,res.decimals))
                VirgoFarm.calculateEarning()
            })
        })
    }

    static calculateEarning(balance){
        let input = $(VirgoFarm.buttons.inputStakingValue).val()
        let apy = (0.25*$("#allowRange").val()*4.34524+5.2)/100
        let duration = $("#allowRange").val()
        let estReward = Math.round((input*(1+apy)-input)/12*duration)
        VirgoFarm.checkStakeValue(balance)
        $('#estReward').html(estReward)
    }

    static getLock(){
        getLocks().then(locks => {
            VirgoFarm.text.stakeCount.html(locks.length)

            for ( let i = 0; i < locks.length;i++){

                if (locks.length <= 0){
                    VirgoFarm.div.buySwapPopup.show()
                }

                const element = VirgoFarm.div.stakingDiv.clone()
                element.find('.infoStaking').hide()
               element.find('.stakedVGO').html(VirgoFarm.formatNumber(locks[i].amount))
                element.find('.totalEarn').html(VirgoFarm.formatNumber(locks[i].totalEarnings).toFixed(2))
                element.find('.availableEarn').html(VirgoFarm.formatNumber(locks[i].earnings))
                element.find('.APR').html(.25*locks[i].lockDuration+5.2)

                element.find('.showStaking').click(function () {
                    if ($(this).hasClass('opened')) {
                        $(this).removeClass('opened')
                        $(this).css('transform', "rotate(0deg)")
                        $(this).parent().find('.infoStaking').hide()

                    } else {
                        $(this).addClass('opened')
                        $(this).css('transform', "rotate(90deg)")
                        element.find('.infoStaking').show()
                        $(this).parent().find('.infoStaking').show()
                    }
                })
                if (locks[i].unlockTime <= Date.now()/1000){
                    element.find('.unlockBtn').html("UNLOCK")
                }else {
                    let remainingDays = Math.round((locks[i].unlockTime-Date.now()/1000)/86400)
                    element.find(".unlockBtn").html(remainingDays + " DAYS").attr('disabled','disabled')
                }

                if (locks[i].earnings >= 0){
                    element.find(".claimBtn").attr('disabled','disabled')
                }

                element.show()
                VirgoFarm.div.stakingList.append(element)
            }
            VirgoFarm.div.loading.hide()


        })
    }

    static formatNumber(amount){
        return amount/Math.pow(10, 8)
    }

    static checkStakeValue(balance){
        console.log(balance)
        if (!VirgoFarm.buttons.inputStakingValue.val() > balance || $('#allowRange').val() >= 0){
            VirgoFarm.buttons.stakeButton.attr("disabled","")
            console.log('1')
        }else {
            console.log('test')
        }
    }

}

const virgofarmPane = new VirgoFarm()
