using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuoraAnswersToPdf
{
    class Program
    {
        static void Main(string[] args)
        {
            while (true)
            {
                try
                {
                    Console.WriteLine("Enter quora urls (JSON array format):");
                    //eg: ["https://www.quora.com/How-do-I-become-less-boring", "https://www.quora.com/What-turns-people-off-about-Quora"]
                    string[] urlList = Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(Console.ReadLine());                    
                    for (int index = 0, urlCount = urlList.Length; index < urlCount; index++)
                    {
                        var phantomJS = new NReco.PhantomJS.PhantomJS();
                        phantomJS.OutputReceived += (sender, e) =>
                        {
                            Console.WriteLine("PhantomJS output: {0}", e.Data);
                        };
                        phantomJS.ErrorReceived += (sender, e) =>
                        {
                            Console.WriteLine("PhantomJS output: {0}", e.Data);
                        };
                        phantomJS.Run("quoratopdf.js", new string[] { urlList[index] });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error: " + ex.Message);
                }
            }        
        }
    }
}
