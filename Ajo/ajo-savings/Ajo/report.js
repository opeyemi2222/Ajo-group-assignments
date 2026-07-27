// ===============================
// AJO SAVE REPORT JAVASCRIPT
// ===============================


// DOWNLOAD PDF FUNCTION

document.getElementById("downloadPDF").addEventListener("click", function(){

    Swal.fire({
        title:"Generating PDF...",
        text:"Please wait",
        allowOutsideClick:false,
        didOpen:()=>{
            Swal.showLoading();
        }
    });


    const report = document.body;


    const options = {

        margin:0.5,

        filename:"AJO_SAVE_Savings_Report.pdf",

        image:{
            type:"jpeg",
            quality:0.98
        },

        html2canvas:{
            scale:2
        },

        jsPDF:{
            unit:"in",
            format:"a4",
            orientation:"portrait"
        }

    };


    html2pdf()
    .set(options)
    .from(report)
    .save()
    .then(()=>{

        Swal.fire({

            icon:"success",
            title:"PDF Downloaded",
            text:"Your savings report has been downloaded."

        });

    });


});




// PRINT REPORT FUNCTION

document.getElementById("printReport")
.addEventListener("click",function(){


    Swal.fire({

        title:"Preparing Print...",
        timer:1000,
        showConfirmButton:false

    });


    setTimeout(()=>{

        window.print();

    },1000);



});




// SHARE REPORT FUNCTION

document.getElementById("shareReport")
.addEventListener("click",function(){



    const shareData = {

        title:"AJO SAVE Report",

        text:
        "My AJO SAVE savings report. Total Saved: ₦250,000. Check my savings progress.",

        url:window.location.href

    };



    if(navigator.share){


        navigator.share(shareData)

        .then(()=>{

            Swal.fire({

                icon:"success",
                title:"Shared Successfully"

            });

        })

        .catch(()=>{});


    }

    else{


        // Copy link for browsers without share support

        navigator.clipboard.writeText(
            window.location.href
        );


        Swal.fire({

            icon:"info",
            title:"Link Copied",
            text:"Share link copied to clipboard."

        });


    }



});



// ===============================
// MONTHLY SAVINGS CHART
// ===============================


const ctx = document.getElementById("reportChart");


new Chart(ctx,{

    type:"line",

    data:{


        labels:[

            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun"

        ],


        datasets:[{

            label:"Monthly Contribution (₦)",

            data:[

                20000,
                35000,
                30000,
                50000,
                45000,
                70000

            ],


            borderWidth:3,

            tension:.4,

            fill:true

        }]

    },


    options:{


        responsive:true,


        plugins:{


            legend:{

                position:"top"

            }


        },


        scales:{


            y:{


                beginAtZero:true


            }


        }



    }


});
